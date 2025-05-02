import logging
from typing import AsyncGenerator, Literal

from openai import AsyncOpenAI
from pydantic import BaseModel


class PatientInfo(BaseModel):
    name: str
    age: int
    gender: str
    weight: float
    height: float


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class DoctorChat:
    def __init__(self):
        self.client = AsyncOpenAI()
        self.logger = logging.getLogger(__name__)

        self.system_prompt = """
            Você é um médico que recebe informações de um paciente e os atuais
            sintomas que ele está apresentando.

            Você deve retornar um diagnóstico baseado nas informações recebidas.

            Suas respostas devem ser sempre em português brasileiro, em formato markdown.

            Não alucine, apenas use as informações recebidas para retornar um
            diagnóstico. Caso não seja possível retornar um diagnóstico, responda
            que não há como determinar o diagnóstico.

            Informações do paciente:
                - Nome: {name}
                - Idade: {age}
                - Sexo: {gender}
                - Peso: {weight}kg
                - Altura: {height}cm
        """

        self.model = "gpt-4.1"
        self.temperature = 0.2
        self.logger.info(f"DoctorChat initialized with model: {self.model}")

    async def diagnose(self, patient_info: PatientInfo, messages: list[Message]) -> AsyncGenerator[str, None]:
        self.logger.info(f"Processing diagnosis request with messages length: {len(messages)}")

        system_prompt = {"role": "developer", "content": self.system_prompt.format(**patient_info.model_dump())}
        self.logger.debug(f"System prompt: {system_prompt}")

        dict_messages = [{"role": message.role, "content": message.content} for message in messages]
        self.logger.debug(f"Messages: {dict_messages}")

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[system_prompt, *dict_messages],  # type: ignore
                temperature=self.temperature,
                stream=True,
            )

            async for chunk in response:
                delta = chunk.choices[0].delta.content

                if delta is not None:
                    yield delta

        except Exception as e:
            self.logger.error(f"Error generating diagnosis: {str(e)}")
            raise
