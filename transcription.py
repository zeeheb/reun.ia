import os
import tempfile
import math
import ffmpeg
from pydub import AudioSegment
import speech_recognition as sr
from openai import OpenAI

class AudioTranscriber:
    """Handles transcription of audio files using different methods."""
    
    def __init__(self, use_openai=True, max_chunk_size_mb=24):
        """Initialize the transcriber.
        
        Args:
            use_openai (bool): Whether to use OpenAI's Whisper API (True) 
                              or local speech recognition (False)
            max_chunk_size_mb (int): Maximum size in MB for audio chunks when using OpenAI
        """
        self.use_openai = use_openai
        # Convert MB to bytes, keeping slightly under the limit for safety
        self.max_chunk_size = max_chunk_size_mb * 1024 * 1024
        if use_openai:
            self.client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    
    def convert_to_wav(self, audio_file_path):
        """Convert audio file to WAV format for compatibility using ffmpeg.
        
        Args:
            audio_file_path (str): Path to the audio file
            
        Returns:
            str: Path to the converted WAV file
        """
        # Create a temporary file for the WAV output
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
        temp_file.close()
        
        try:
            # Use ffmpeg-python for more efficient conversion
            (
                ffmpeg
                .input(audio_file_path)
                .output(temp_file.name, acodec='pcm_s16le', ac=1, ar='16k')
                .run(quiet=True, overwrite_output=True)
            )
            return temp_file.name
        except Exception as e:
            if os.path.exists(temp_file.name):
                os.unlink(temp_file.name)
            raise Exception(f"Error converting audio to WAV using ffmpeg: {e}")
    
    def get_audio_duration(self, audio_file_path):
        """Get the duration of an audio file using ffmpeg.
        
        Args:
            audio_file_path (str): Path to the audio file
            
        Returns:
            float: Duration of the audio in seconds
        """
        try:
            # Get audio file information using ffmpeg
            probe = ffmpeg.probe(audio_file_path)
            # Extract duration from the first audio stream
            duration = float(probe['streams'][0]['duration'])
            return duration
        except Exception as e:
            raise Exception(f"Error getting audio duration: {e}")
    
    def split_audio(self, audio_file_path):
        """Split large audio file into smaller chunks using ffmpeg.
        
        Args:
            audio_file_path (str): Path to the audio file
            
        Returns:
            list: Paths to the split audio chunks
        """
        # Get the file size
        file_size = os.path.getsize(audio_file_path)
        
        # If file is small enough, return it without splitting
        if file_size <= self.max_chunk_size:
            return [audio_file_path]
        
        # Get the duration of the audio
        duration = self.get_audio_duration(audio_file_path)
        
        # Calculate the number of chunks needed based on file size
        chunks_needed = math.ceil(file_size / self.max_chunk_size)
        # Duration of each chunk in seconds
        chunk_duration = duration / chunks_needed
        
        # Create temporary directory for chunks
        temp_dir = tempfile.mkdtemp()
        chunk_paths = []
        
        # Split the audio into chunks using ffmpeg
        for i in range(chunks_needed):
            start_time = i * chunk_duration
            # For the last chunk, use the full remaining duration
            duration_arg = chunk_duration if i < chunks_needed - 1 else (duration - start_time)
            
            # Create the output path for this chunk
            chunk_path = os.path.join(temp_dir, f"chunk_{i}.wav")
            
            try:
                # Use ffmpeg to extract the chunk
                (
                    ffmpeg
                    .input(audio_file_path, ss=start_time, t=duration_arg)
                    .output(chunk_path, acodec='pcm_s16le', ac=1, ar='16k')
                    .run(quiet=True, overwrite_output=True)
                )
                chunk_paths.append(chunk_path)
            except Exception as e:
                # Clean up created chunks on error
                for path in chunk_paths:
                    if os.path.exists(path):
                        os.unlink(path)
                raise Exception(f"Error splitting audio with ffmpeg: {e}")
        
        return chunk_paths
    
    def transcribe_with_openai(self, audio_file_path):
        """Transcribe audio using OpenAI's Whisper API.
        
        Args:
            audio_file_path (str): Path to the audio file
            
        Returns:
            str: Transcribed text
        """
        try:
            # Check file size and split if necessary
            chunk_paths = self.split_audio(audio_file_path)
            
            # If we have multiple chunks, transcribe each and combine
            if len(chunk_paths) > 1:
                transcripts = []
                for i, chunk_path in enumerate(chunk_paths):
                    print(f"Transcribing chunk {i+1}/{len(chunk_paths)}...")
                    with open(chunk_path, "rb") as audio_file:
                        response = self.client.audio.transcriptions.create(
                            model="whisper-1",
                            file=audio_file,
                            language="pt"  # Portuguese (Brazil)
                        )
                    transcripts.append(response.text)
                    
                    # Clean up the chunk file if it's not the original
                    if chunk_path != audio_file_path:
                        os.unlink(chunk_path)
                
                # Combine all transcripts
                return " ".join(transcripts)
            else:
                # Single file case
                with open(audio_file_path, "rb") as audio_file:
                    response = self.client.audio.transcriptions.create(
                        model="whisper-1",
                        file=audio_file,
                        language="pt"  # Portuguese (Brazil)
                    )
                return response.text
                
        except Exception as e:
            # Clean up any remaining chunk files
            for path in chunk_paths:
                if path != audio_file_path and os.path.exists(path):
                    os.unlink(path)
            
            # Clean up the temp directory if it exists
            if len(chunk_paths) > 1:
                os.rmdir(os.path.dirname(chunk_paths[0]))
                
            raise Exception(f"Error with OpenAI transcription: {e}")
    
    def transcribe_with_local(self, audio_file_path):
        """Transcribe audio using local speech recognition.
        
        Args:
            audio_file_path (str): Path to the audio file
            
        Returns:
            str: Transcribed text
        """
        recognizer = sr.Recognizer()
        try:
            # For local transcription, we'll also need to handle large files
            chunk_paths = self.split_audio(audio_file_path)
            transcripts = []
            
            for i, chunk_path in enumerate(chunk_paths):
                print(f"Transcribing chunk {i+1}/{len(chunk_paths)}...")
                with sr.AudioFile(chunk_path) as source:
                    audio_data = recognizer.record(source)
                    text = recognizer.recognize_google(audio_data, language="pt-BR")
                    transcripts.append(text)
                
                # Clean up the chunk file if it's not the original
                if chunk_path != audio_file_path:
                    os.unlink(chunk_path)
            
            # Clean up the temp directory if it exists
            if len(chunk_paths) > 1:
                os.rmdir(os.path.dirname(chunk_paths[0]))
                
            return " ".join(transcripts)
            
        except Exception as e:
            # Clean up any remaining chunk files
            for path in chunk_paths:
                if path != audio_file_path and os.path.exists(path):
                    os.unlink(path)
            
            # Clean up the temp directory if it exists
            if len(chunk_paths) > 1 and os.path.exists(os.path.dirname(chunk_paths[0])):
                os.rmdir(os.path.dirname(chunk_paths[0]))
                
            raise Exception(f"Error with local transcription: {e}")
    
    def transcribe(self, audio_file_path):
        """Main method to transcribe an audio file.
        
        Args:
            audio_file_path (str): Path to the audio file
            
        Returns:
            str: Transcribed text
        """
        # Convert audio to WAV format
        wav_file_path = self.convert_to_wav(audio_file_path)
        
        try:
            # Choose transcription method
            if self.use_openai:
                transcript = self.transcribe_with_openai(wav_file_path)
            else:
                transcript = self.transcribe_with_local(wav_file_path)
            
            return transcript
        finally:
            # Clean up temporary file
            if os.path.exists(wav_file_path):
                os.unlink(wav_file_path) 