from agno.agent import Agent
from agno.models.openai import OpenAIChat

class MeetingAnalyzer:
    """Handles analysis of meeting transcripts using Agno AI agents."""
    
    def __init__(self, model_id="gpt-4o"):
        """Initialize the meeting analyzer.
        
        Args:
            model_id (str): The model ID to use for the AI agent
        """
        self.agent = Agent(
            model=OpenAIChat(id=model_id),
            description="You are an expert meeting assistant that analyzes transcripts of business meetings in Portuguese.",
            instructions=[
                "When analyzing meeting transcripts, focus on identifying key insights, action items, and important discussion points.",
                "For Brazilian Portuguese content, understand cultural context and business terminology used in Brazil.",
                "Always be concise and well-organized in your analysis output."
            ],
            markdown=True
        )
    
    def extract_insights(self, transcript):
        """Extract key insights from the meeting transcript.
        
        Args:
            transcript (str): Meeting transcript text
            
        Returns:
            str: Key insights from the meeting, or a default message if analysis fails
        """
        try:
            prompt = f"""
            Analise a seguinte transcrição de reunião e identifique os principais insights e descobertas:
            
            {transcript}
            
            Liste no máximo 5 insights principais que foram discutidos nesta reunião.
            """
            
            # Using print_response with capture=True to get the text response
            response = self.agent.print_response(prompt, stream=False, capture=True)
            
            # Check for empty or invalid response
            if not response or len(response.strip()) == 0:
                return "Não foi possível extrair insights desta transcrição."
                
            return response
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
            prompt = f"""
            Analise a seguinte transcrição de reunião e identifique todos os itens de ação ou tarefas mencionadas:
            
            {transcript}
            
            Para cada item de ação, indique:
            - A tarefa a ser realizada
            - Quem é responsável (se mencionado)
            - Prazo (se mencionado)
            """
            
            # Using print_response with capture=True to get the text response
            response = self.agent.print_response(prompt, stream=False, capture=True)
            
            # Check for empty or invalid response
            if not response or len(response.strip()) == 0:
                return "Não foi possível extrair itens de ação desta transcrição."
                
            return response
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
            prompt = f"""
            Analise a seguinte transcrição de reunião e crie uma lista de tópicos que resuma a discussão:
            
            {transcript}
            
            Organize os pontos de discussão em uma lista de marcadores (bullet points) clara e concisa.
            """
            
            # Using print_response with capture=True to get the text response
            response = self.agent.print_response(prompt, stream=False, capture=True)
            
            # Check for empty or invalid response
            if not response or len(response.strip()) == 0:
                return "Não foi possível extrair pontos de resumo desta transcrição."
                
            return response
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
        # Process each analysis in sequence
        # If transcript is too short, return default messages
        if not transcript or len(transcript.strip()) < 50:
            return {
                "insights": "A transcrição é muito curta para análise.",
                "action_items": "A transcrição é muito curta para análise.",
                "bullet_points": "A transcrição é muito curta para análise."
            }
            
        # Limit transcript size if too large (some models have context limits)
        max_length = 15000  # Characters
        processed_transcript = transcript[:max_length] if len(transcript) > max_length else transcript
        
        if len(transcript) > max_length:
            print(f"Warning: Transcript truncated from {len(transcript)} to {max_length} characters for analysis")
        
        # Process each analysis in sequence
        insights = self.extract_insights(processed_transcript)
        action_items = self.extract_action_items(processed_transcript)
        bullet_points = self.generate_bullet_points(processed_transcript)
        
        # Return combined results
        return {
            "insights": insights,
            "action_items": action_items,
            "bullet_points": bullet_points
        } 