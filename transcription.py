import os
import tempfile
import math
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
        """Convert audio file to WAV format for compatibility.
        
        Args:
            audio_file_path (str): Path to the audio file
            
        Returns:
            str: Path to the converted WAV file
        """
        # Create a temporary file for the WAV output
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
        temp_file.close()
        
        # Load the audio using pydub and export as WAV
        try:
            audio = AudioSegment.from_file(audio_file_path)
            audio.export(temp_file.name, format="wav")
            return temp_file.name
        except Exception as e:
            os.unlink(temp_file.name)
            raise Exception(f"Error converting audio to WAV: {e}")
    
    def split_audio(self, audio_file_path):
        """Split large audio file into smaller chunks that fit within API limits.
        
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
        
        # Load the audio file
        audio = AudioSegment.from_file(audio_file_path)
        
        # Calculate the number of chunks needed
        # Using duration-based splitting instead of size-based for more reliable results
        duration_ms = len(audio)
        # Estimate how many chunks we need based on file size ratio
        chunks_needed = math.ceil(file_size / self.max_chunk_size)
        chunk_duration_ms = duration_ms // chunks_needed
        
        # Create temporary directory for chunks
        temp_dir = tempfile.mkdtemp()
        chunk_paths = []
        
        # Split the audio into chunks
        for i in range(chunks_needed):
            start_ms = i * chunk_duration_ms
            end_ms = min((i + 1) * chunk_duration_ms, duration_ms)
            
            chunk = audio[start_ms:end_ms]
            
            # Save the chunk to a temporary file
            chunk_path = os.path.join(temp_dir, f"chunk_{i}.wav")
            chunk.export(chunk_path, format="wav")
            chunk_paths.append(chunk_path)
        
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