import logging

from openai import OpenAI
from openai.types.responses import Response


class DoctorChat:
    def __init__(self):
        self.client = OpenAI()
        self.logger = logging.getLogger(__name__)

        self.system_prompt = """
            Você é um médico que recebe informações de um paciente e os atuais
            sintomas que ele está apresentando.

            Você deve retornar um diagnóstico baseado nas informações recebidas.

            Suas respostas devem ser sempre em português brasileiro, em texto
            simples, sem formatação HTML ou Markdown.

            Não alucine, apenas use as informações recebidas para retornar um
            diagnóstico. Caso não seja possível retornar um diagnóstico, responda
            que não há como determinar o diagnóstico.

            Informações do paciente:
            {history}
        """

        self.model = "gpt-4o"
        self.temperature = 0.2
        self.logger.info(f"DoctorChat initialized with model: {self.model}")

    def diagnose(self, history: str, symptoms: str) -> Response:
        self.logger.info(
            f"Processing diagnosis request with symptoms length: {len(symptoms)}"
        )

        try:
            response = self.client.responses.create(
                model=self.model,
                instructions=self.system_prompt.format(history=history),
                input=symptoms,
                temperature=self.temperature,
            )

            self.logger.info(
                f"Diagnosis generated successfully. Response ID: {response.id}"
            )
            return response

        except Exception as e:
            self.logger.error(f"Error generating diagnosis: {str(e)}")
            raise
