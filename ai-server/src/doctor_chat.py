from openai import OpenAI
from openai.types.responses import Response


class DoctorChat:
    def __init__(self):
        self.client = OpenAI()

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

    def diagnose(self, history: str, symptoms: str) -> Response:
        response = self.client.responses.create(
            model=self.model,
            instructions=self.system_prompt.format(history=history),
            input=symptoms,
            temperature=self.temperature,
        )

        return response
