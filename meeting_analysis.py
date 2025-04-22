from agno.agent import Agent
from agno.models.openai import OpenAIChat
import re

class MeetingAnalyzer:
    """Handles analysis of meeting transcripts using Agno AI agents."""
    
    def __init__(self, model_id="gpt-4.1", chunk_size=10000, overlap=1000):
        """Initialize the meeting analyzer.
        
        Args:
            model_id (str): The model ID to use for the AI agent
            chunk_size (int): Maximum size in characters for each transcript chunk
            overlap (int): Number of characters to overlap between chunks
        """
        self.agent = Agent(
            model=OpenAIChat(id=model_id),
            description="You are an expert meeting assistant that analyzes transcripts of business meetings in Portuguese.",
            instructions=[
                "When analyzing meeting transcripts, focus on identifying key insights, action items, and important discussion points.",
                "For Brazilian Portuguese content, understand cultural context and business terminology used in Brazil.",
                "Always be concise and well-organized in your analysis output.",
                "Do not use HTML or markdown formatting in your responses. Use plain text only."
            ],
            markdown=False
        )
        self.chunk_size = chunk_size
        self.overlap = overlap
    
    def _strip_html_markdown(self, text):
        """Strip HTML and Markdown formatting from text.
        
        Args:
            text (str): Text that may contain HTML or Markdown
            
        Returns:
            str: Clean text without HTML or Markdown
        """
        if not text:
            return text
            
        # Remove HTML tags
        text = re.sub(r'<[^>]*>', '', text)
        
        # Convert markdown headers to plain text
        text = re.sub(r'#{1,6}\s*(.*?)$', r'\1', text, flags=re.MULTILINE)
        
        # Remove markdown bold and italic formatting
        text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
        text = re.sub(r'\*(.*?)\*', r'\1', text)
        text = re.sub(r'__(.*?)__', r'\1', text)
        text = re.sub(r'_(.*?)_', r'\1', text)
        
        # Remove markdown links - keep the text, remove the URL
        text = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', text)
        
        # Convert markdown lists to plain text lists with consistent formatting
        # Keep the bullet/number but standardize format
        text = re.sub(r'^\s*[\*\-\+]\s+', '• ', text, flags=re.MULTILINE)
        
        # Standardize numbered lists
        text = re.sub(r'^\s*(\d+)[\.\)]\s+', r'\1. ', text, flags=re.MULTILINE)
        
        return text
    
    def _split_transcript_into_chunks(self, transcript):
        """Split a large transcript into overlapping chunks.
        
        Args:
            transcript (str): The full transcript text
            
        Returns:
            list: List of transcript chunks
        """
        # If transcript is smaller than chunk size, return it as a single chunk
        if len(transcript) <= self.chunk_size:
            return [transcript]
            
        chunks = []
        start = 0
        
        while start < len(transcript):
            # Calculate end position for this chunk
            end = start + self.chunk_size
            
            # If this isn't the last chunk, try to break at a sentence boundary
            if end < len(transcript):
                # Look for sentence boundaries (., !, ?) within 200 chars of the end
                search_area = transcript[max(end - 200, start):min(end + 200, len(transcript))]
                
                # Find the last sentence boundary in the search area
                for punct in ['. ', '! ', '? ']:
                    last_boundary = search_area.rfind(punct)
                    if last_boundary != -1:
                        # Adjust end to break at this sentence boundary
                        end = max(end - 200, start) + last_boundary + 2  # +2 to include the punctuation and space
                        break
            
            # Add this chunk to our list
            chunks.append(transcript[start:min(end, len(transcript))])
            
            # Start next chunk, with overlap
            start = max(0, end - self.overlap)
        
        return chunks
    
    def _combine_analysis_results(self, results_list):
        """Combine multiple analysis results into a single coherent result.
        
        Args:
            results_list (list): List of analysis results from different chunks
            
        Returns:
            str: Combined analysis result
        """
        if not results_list:
            return "Não foi possível realizar a análise."
            
        # For a single result, just return it
        if len(results_list) == 1:
            return self._strip_html_markdown(results_list[0])
            
        # For multiple results, we need to consolidate
        combined = ""
        
        # Extract unique points by removing duplicates
        seen_points = set()
        
        for result in results_list:
            # Clean the result
            result = self._strip_html_markdown(result)
            
            # Split into points (assuming each point starts with a bullet or number)
            points = []
            current_point = ""
            
            for line in result.split('\n'):
                line = line.strip()
                # Check if this line starts a new point (bullet or number)
                if line and (line.startswith('•') or line.startswith('-') or (line[0].isdigit() and line[1:3] in ['. ', ') '])):
                    if current_point:
                        points.append(current_point)
                    current_point = line
                elif current_point:
                    current_point += '\n' + line
            
            # Add the last point if there is one
            if current_point:
                points.append(current_point)
            
            # Add only unique points
            for point in points:
                # Create a simplified version for comparison (lowercase, no punctuation)
                simplified = ''.join(c.lower() for c in point if c.isalnum() or c.isspace())
                
                # Check if we've seen a similar point
                is_duplicate = False
                for seen in seen_points:
                    # Check for high similarity (80% match)
                    if len(simplified) > 0 and len(seen) > 0:
                        similarity = sum(1 for a, b in zip(simplified, seen) if a == b) / max(len(simplified), len(seen))
                        if similarity > 0.8:
                            is_duplicate = True
                            break
                
                if not is_duplicate:
                    seen_points.add(simplified)
                    combined += point + '\n\n'
        
        return combined.strip()
    
    def extract_insights(self, transcript):
        """Extract key insights from the meeting transcript.
        
        Args:
            transcript (str): Meeting transcript text
            
        Returns:
            str: Key insights from the meeting, or a default message if analysis fails
        """
        try:
            # Split transcript into chunks if necessary
            chunks = self._split_transcript_into_chunks(transcript)
            
            # Process each chunk
            all_insights = []
            
            for i, chunk in enumerate(chunks):
                chunk_prompt = f"""
                Analise a seguinte {'parte da ' if len(chunks) > 1 else ''}transcrição de reunião e identifique os principais insights e descobertas:
                
                {chunk}
                
                {'Esta é a parte ' + str(i+1) + ' de ' + str(len(chunks)) + ' da transcrição completa.' if len(chunks) > 1 else ''}
                Liste no máximo {'3' if len(chunks) > 1 else '5'} insights principais que foram discutidos nesta {'parte da ' if len(chunks) > 1 else ''}reunião.
                Não use formatação HTML ou markdown na sua resposta.
                """
                
                # Using run method directly to get the response
                response = self.agent.run(chunk_prompt, stream=False)
                
                # Extract the content from the response
                if response and hasattr(response, 'content'):
                    all_insights.append(response.content)
                    
            # Combine insights from all chunks
            if all_insights:
                return self._combine_analysis_results(all_insights)
            else:
                return "Não foi possível extrair insights desta transcrição."
                
        except Exception as e:
            print(f"Error extracting insights: {str(e)}")
            return "Ocorreu um erro ao analisar os insights da reunião."
    
    def extract_action_items(self, transcript):
        """Extract action items from the meeting transcript.
        
        Args:
            transcript (str): Meeting transcript text
            
        Returns:
            str: Action items identified in the meeting, or a default message if analysis fails
        """
        try:
            # Split transcript into chunks if necessary
            chunks = self._split_transcript_into_chunks(transcript)
            
            # Process each chunk
            all_action_items = []
            
            for i, chunk in enumerate(chunks):
                chunk_prompt = f"""
                Analise a seguinte {'parte da ' if len(chunks) > 1 else ''}transcrição de reunião e identifique todos os itens de ação ou tarefas mencionadas:
                
                {chunk}
                
                {'Esta é a parte ' + str(i+1) + ' de ' + str(len(chunks)) + ' da transcrição completa.' if len(chunks) > 1 else ''}
                Para cada item de ação, indique:
                - A tarefa a ser realizada
                - Quem é responsável (se mencionado)
                - Prazo (se mencionado)
                Não use formatação HTML ou markdown na sua resposta.
                """
                
                # Using run method directly to get the response
                response = self.agent.run(chunk_prompt, stream=False)
                
                # Extract the content from the response
                if response and hasattr(response, 'content'):
                    all_action_items.append(response.content)
                    
            # Combine action items from all chunks
            if all_action_items:
                return self._combine_analysis_results(all_action_items)
            else:
                return "Não foi possível extrair itens de ação desta transcrição."
                
        except Exception as e:
            print(f"Error extracting action items: {str(e)}")
            return "Ocorreu um erro ao analisar os itens de ação da reunião."
    
    def generate_bullet_points(self, transcript):
        """Generate bullet point summary of the discussion.
        
        Args:
            transcript (str): Meeting transcript text
            
        Returns:
            str: Bullet point summary of the meeting discussion, or a default message if analysis fails
        """
        try:
            # Split transcript into chunks if necessary
            chunks = self._split_transcript_into_chunks(transcript)
            
            # Process each chunk
            all_bullet_points = []
            
            for i, chunk in enumerate(chunks):
                chunk_prompt = f"""
                Analise a seguinte {'parte da ' if len(chunks) > 1 else ''}transcrição de reunião e crie uma lista de tópicos que resuma a discussão:
                
                {chunk}
                
                {'Esta é a parte ' + str(i+1) + ' de ' + str(len(chunks)) + ' da transcrição completa.' if len(chunks) > 1 else ''}
                Organize os pontos de discussão em uma lista de marcadores (bullet points) clara e concisa.
                Não use formatação HTML ou markdown na sua resposta.
                """
                
                # Using run method directly to get the response
                response = self.agent.run(chunk_prompt, stream=False)
                
                # Extract the content from the response
                if response and hasattr(response, 'content'):
                    all_bullet_points.append(response.content)
                    
            # Combine bullet points from all chunks
            if all_bullet_points:
                return self._combine_analysis_results(all_bullet_points)
            else:
                return "Não foi possível extrair pontos de resumo desta transcrição."
                
        except Exception as e:
            print(f"Error generating bullet points: {str(e)}")
            return "Ocorreu um erro ao gerar o resumo da reunião."
    
    def analyze_transcript(self, transcript):
        """Perform complete analysis of the meeting transcript.
        
        Args:
            transcript (str): Meeting transcript text
            
        Returns:
            dict: Analysis results including insights, action items, and bullet points
        """
        # If transcript is too short, return default messages
        if not transcript or len(transcript.strip()) < 50:
            return {
                "insights": "A transcrição é muito curta para análise.",
                "action_items": "A transcrição é muito curta para análise.",
                "bullet_points": "A transcrição é muito curta para análise."
            }
        
        # Process each analysis in sequence
        insights = self.extract_insights(transcript)
        action_items = self.extract_action_items(transcript)
        bullet_points = self.generate_bullet_points(transcript)
        
        # Ensure all results are clean, plain text
        insights = self._strip_html_markdown(insights)
        action_items = self._strip_html_markdown(action_items)
        bullet_points = self._strip_html_markdown(bullet_points)
        
        # Return combined results
        return {
            "insights": insights,
            "action_items": action_items,
            "bullet_points": bullet_points
        } 