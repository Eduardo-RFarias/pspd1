# Implementação de Sistema Distribuído com gRPC e Virtualização

**Curso**: Engenharia de Software  
**Disciplina**: Programação para Sistemas Paralelos e Distribuídos  
**Turma**: 2025/1  
**Alunos**:

- Eduardo Rodrigues de Farias - 190086521
- Augusto Durães Camargo - 190084731
- Arthur Ferreira Rodrigues - 200056981
- Carlos Eduardo Miranda Roriz - 190011424
- Gabriel Luiz de Souza Gomes - 190013354

## Introdução

Este relatório documenta a implementação de um sistema distribuído que utiliza gRPC como tecnologia de comunicação entre componentes, hospedados em máquinas virtuais gerenciadas por KVM/QEMU através da API Libvirt. O sistema é composto por quatro componentes principais: um servidor de AI (Python), um servidor de banco de dados (Node.js/TypeScript), um servidor web (Go) e um cliente (Angular).

O objetivo principal do experimento foi demonstrar a integração entre diferentes serviços distribuídos utilizando gRPC, além de obter experiência prática com virtualização para hospedagem de componentes em máquinas virtuais independentes.

## Framework gRPC

### Elementos Constituintes

O gRPC é um framework RPC (Remote Procedure Call) de alto desempenho e código aberto desenvolvido inicialmente pelo Google. Seus principais componentes são:

#### Protocol Buffers (Protobuf)

O Protobuf é um mecanismo de serialização de dados estruturados desenvolvido pelo Google. Ele permite definir a estrutura de dados uma vez em um arquivo `.proto` e gerar código para múltiplas linguagens, garantindo a interoperabilidade entre os diferentes serviços. Comparado com JSON ou XML, o Protobuf oferece:

- Serialização/desserialização mais rápida
- Tamanho de mensagem reduzido
- Tipagem estática
- Geração automática de código em múltiplas linguagens

#### HTTP/2

O gRPC utiliza HTTP/2 como protocolo de transporte, o que proporciona várias vantagens:

- Multiplexação: múltiplas solicitações/respostas podem ser enviadas em paralelo através de uma única conexão TCP
- Compressão de cabeçalhos: reduz o overhead de comunicação
- Streams bidirecionais: permite comunicação full-duplex
- Priorização de requisições: otimiza o uso dos recursos de rede

### Tipos de Comunicação em gRPC

O gRPC suporta quatro tipos de métodos de comunicação:

1. **Unário (Unary RPC)**: O cliente envia uma única requisição e recebe uma única resposta, semelhante a uma chamada de função tradicional.

2. **Streaming do Servidor**: O cliente envia uma única requisição e recebe um stream de respostas do servidor, útil para monitoramento contínuo ou download de grandes volumes de dados.

3. **Streaming do Cliente**: O cliente envia um stream de mensagens e recebe uma única resposta do servidor, útil para upload de dados grandes ou processamento sequencial.

4. **Streaming Bidirecional**: Tanto o cliente quanto o servidor enviam streams de mensagens de forma independente, permitindo comunicação em tempo real e alta interatividade.

### Comparação com Outras Tecnologias de Aplicações Distribuídas

#### gRPC vs REST API

| Característica       | gRPC                                 | REST API                                          |
| -------------------- | ------------------------------------ | ------------------------------------------------- |
| Protocolo            | HTTP/2                               | HTTP/1.1 ou HTTP/2                                |
| Formato de Payload   | Protocol Buffers (binário)           | JSON/XML (texto)                                  |
| Contrato de API      | Rígido (arquivo .proto)              | Flexível (OpenAPI/Swagger)                        |
| Streaming            | Nativo                               | Limitado                                          |
| Geração de código    | Automática para múltiplas linguagens | Geralmente manual ou via ferramentas de terceiros |
| Performance          | Alta                                 | Média                                             |
| Overhead de rede     | Baixo                                | Médio a alto                                      |
| Curva de aprendizado | Moderada a alta                      | Baixa                                             |

#### gRPC vs SOAP

| Característica        | gRPC                       | SOAP                      |
| --------------------- | -------------------------- | ------------------------- |
| Protocolo             | HTTP/2                     | Vários (HTTP, SMTP, etc.) |
| Formato de mensagem   | Protocol Buffers (binário) | XML (texto)               |
| Complexidade          | Média                      | Alta                      |
| Performance           | Alta                       | Baixa                     |
| Interoperabilidade    | Alta via protobuf          | Alta via padrões WS-\*    |
| Recursos de segurança | TLS/SSL                    | WS-Security               |

#### gRPC vs WebSockets

| Característica                    | gRPC                | WebSockets                  |
| --------------------------------- | ------------------- | --------------------------- |
| Modelo de comunicação             | RPC estruturado     | Canal bidirecional genérico |
| Estrutura de mensagem             | Fortemente tipada   | Não estruturada por padrão  |
| Geração de código                 | Automática          | Manual                      |
| Adequação para streaming contínuo | Muito boa           | Excelente                   |
| Presença em navegadores           | Limitada (gRPC-Web) | Nativa                      |

## Detalhes da Aplicação Implementada

### Arquitetura do Sistema

Nossa aplicação é composta por quatro componentes principais, cada um executando em uma máquina virtual dedicada:

1. **Servidor de AI (Python)**: Responsável pelo processamento de modelos de inteligência artificial, implementado em Python com o framework gRPC.

2. **Servidor de Banco de Dados (Node.js/TypeScript)**: Gerencia o armazenamento persistente dos dados, utilizando Prisma como ORM.

3. **Servidor Web (Go)**: Implementa a lógica de negócios principal e coordena a comunicação entre o cliente e os outros serviços, desenvolvido em Go.

4. **Cliente (Angular)**: Interface de usuário que se comunica com o servidor web, desenvolvido com Angular.

### Implementação da Comunicação gRPC

Os principais serviços gRPC implementados incluem:

1. **Serviço de Previsão AI**:

   - Processamento de modelos preditivos
   - Análise de dados em tempo real

2. **Serviço de Persistência**:

   - Armazenamento e recuperação de dados
   - Operações CRUD

3. **Serviço de Negócios**:
   - Coordenação de fluxos de trabalho
   - Agregação de dados de múltiplas fontes

### Dificuldades Encontradas e Soluções

Durante o desenvolvimento e implantação do sistema, enfrentamos diversos desafios:

1. **Interoperabilidade entre linguagens**: A geração de código para diferentes linguagens através do Protobuf resolveu a maioria dos problemas, mas ainda foi necessário adaptações específicas para cada plataforma.

2. **Configuração das máquinas virtuais**: A configuração inicial das VMs exigiu um esforço considerável para garantir comunicação adequada entre os serviços.

3. **Tratamento de erros distribuídos**: Implementamos um sistema de registro centralizado e propagação estruturada de erros para facilitar o diagnóstico de problemas em um ambiente distribuído.

### Metodologia

O desenvolvimento seguiu uma abordagem iterativa:

1. Definição dos contratos de serviço em arquivos `.proto`
2. Implementação inicial dos serviços individuais
3. Integração progressiva dos componentes
4. Testes de comunicação entre os serviços
5. Implantação em máquinas virtuais
6. Testes de carga e desempenho

### Instruções para Teste

Para testar a aplicação:

1. Descompacte o arquivo `vm-export.tar.xz` que contém as imagens das máquinas virtuais
2. Importe as máquinas virtuais usando o comando `virsh define <arquivo.xml>` para cada servidor
3. Inicie as máquinas virtuais na seguinte ordem: database-server, ai-server, web-server
4. Acesse a interface web através do navegador em http://[IP-da-VM-web]:8080

## Virtualização com KVM, QEMU e Libvirt

### Arquitetura Interna do KVM/QEMU

O Kernel-based Virtual Machine (KVM) é um módulo de virtualização para o kernel Linux que permite que o sistema operacional funcione como um hypervisor. Quando combinado com o QEMU (emulador de hardware), forma uma solução completa de virtualização:

- **KVM**: fornece a infraestrutura de virtualização no nível do kernel, transformando o Linux em um hypervisor tipo 1 (bare-metal)
- **QEMU**: fornece emulação de hardware para dispositivos virtuais e gerencia os recursos computacionais das VMs

A arquitetura possui as seguintes camadas:

1. **Hardware físico**: CPU com suporte a virtualização (Intel VT-x ou AMD-V), memória, armazenamento, rede
2. **Kernel Linux com KVM**: expõe a interface `/dev/kvm` para aplicações de usuário
3. **QEMU**: usa a interface `/dev/kvm` para acessar os recursos de virtualização do hardware
4. **Libvirt**: API de gerenciamento que abstrai os detalhes de KVM/QEMU
5. **Ferramentas de gerenciamento**: virsh, virt-manager, virt-install que usam Libvirt
6. **Máquina virtual**: sistema operacional convidado e aplicativos

### Firmware em Máquinas Virtuais

#### SeaBIOS

SeaBIOS é uma implementação open-source de BIOS x86 desenvolvida como parte do projeto coreboot, mas também usada como BIOS padrão para máquinas virtuais QEMU/KVM. Características principais:

- Implementação de BIOS padrão x86 compatível com interfaces tradicionais
- Suporte a boot de múltiplos dispositivos (PXE, USB, CD-ROM, HD)
- Fácil customização através de arquivos de configuração
- Pequena pegada de memória e inicialização rápida

#### Coreboot

Coreboot (anteriormente conhecido como LinuxBIOS) é um projeto de firmware livre e de código aberto que visa substituir BIOSes proprietárias em computadores. Em ambiente de virtualização, pode ser usado como uma alternativa à SeaBIOS:

- Inicialização extremamente rápida (inicializa apenas o hardware necessário)
- Design modular com separação entre inicialização de hardware e ambiente de execução
- Suporte a "payloads" variados (GRUB2, SeaBIOS, Linux direto)
- Foco em segurança e transparência

No nosso ambiente de virtualização, testamos ambos os firmwares e observamos as seguintes diferenças:

| Característica               | SeaBIOS   | Coreboot  |
| ---------------------------- | --------- | --------- |
| Tempo de boot                | Bom       | Excelente |
| Compatibilidade              | Excelente | Boa       |
| Customização                 | Moderada  | Alta      |
| Complexidade de configuração | Baixa     | Alta      |

### Comandos Utilizados na Virtualização

Durante o processo de criação e gerenciamento das máquinas virtuais, utilizamos os seguintes comandos:

#### Criação e Configuração

```bash
# Criação de máquinas virtuais
virt-install --name ai-server --ram 2048 --vcpus 2 --disk path=/var/lib/libvirt/images/ai-server.qcow2,size=10 --os-variant ubuntu20.04 --network bridge=virbr0 --graphics vnc --console pty,target_type=serial --cdrom /path/to/ubuntu20.04.iso

# Configuração de rede
virsh net-define network.xml
virsh net-start default
virsh net-autostart default

# Definição de recursos
virsh setmaxmem ai-server 4G --config
virsh setmem ai-server 2G --config
virsh setvcpus ai-server 2 --config
```

#### Gerenciamento

```bash
# Iniciar/parar máquinas virtuais
virsh start ai-server
virsh shutdown database-server
virsh destroy web-server  # Forçar parada

# Salvar/restaurar estado
virsh save ai-server ai-server.state
virsh restore ai-server.state

# Acesso à console
virsh console ai-server
```

#### Backup e Exportação

```bash
# Exportação de configuração
virsh dumpxml ai-server > ai-server.xml
virsh dumpxml database-server > database-server.xml
virsh dumpxml web-server > web-server.xml

# Exportação de disco
cp /var/lib/libvirt/images/ai-server.qcow2 /home/eduardo/Projetos/pspd1/vm-export/
cp /var/lib/libvirt/images/database-server.qcow2 /home/eduardo/Projetos/pspd1/vm-export/
cp /var/lib/libvirt/images/web-server.qcow2 /home/eduardo/Projetos/pspd1/vm-export/

# Compressão
tar czf vm-export.tar.gz vm-export/
tar cJf vm-export.tar.xz vm-export/  # Compressão maior
```

### Dificuldades Encontradas na Virtualização

Durante o processo de virtualização, enfrentamos os seguintes desafios:

1. **Desempenho**: As VMs que executavam cargas de trabalho intensivas (especialmente o servidor de AI) exigiram ajustes finos na alocação de recursos.

2. **Rede entre VMs**: Configurar o ambiente de rede para permitir comunicação eficiente entre as máquinas virtuais enquanto mantemos segurança.

3. **Persistência de dados**: Garantir que os dados do banco de dados persistam entre reinicializações da VM.

4. **Overhead de virtualização**: Mitigar o overhead natural da virtualização através de técnicas como paravirtualização.

## Conclusão

A implementação deste sistema distribuído usando gRPC e virtualização KVM/QEMU nos permitiu explorar na prática os conceitos de computação distribuída e comunicação entre serviços. A escolha do gRPC como tecnologia de comunicação mostrou-se adequada para o cenário, oferecendo desempenho superior e maior flexibilidade em comparação com alternativas como REST ou SOAP.

A infraestrutura de virtualização KVM/QEMU, gerenciada através da API Libvirt, proporcionou um ambiente isolado e controlado para cada componente do sistema, facilitando o desenvolvimento e testes. As ferramentas de gerenciamento de máquinas virtuais demonstraram ser robustas e flexíveis, permitindo ajustes finos no ambiente de execução de cada serviço.

Os principais aprendizados incluem a importância de um design adequado do contrato de API, o impacto da escolha do protocolo de comunicação no desempenho global do sistema, e as considerações necessárias ao implantar serviços distribuídos em ambientes virtualizados.

### Auto-avaliação do Eduardo Rodrigues de Farias

Nota de auto-avaliação: 10/10

### Auto-avaliação do Augusto Durães Camargo

Nota de auto-avaliação: 10/10

### Auto-avaliação do Arthur Ferreira Rodrigues

Nota de auto-avaliação: 10/10

### Auto-avaliação do Carlos Eduardo Miranda Roriz

Nota de auto-avaliação: 10/10

### Auto-avaliação do Gabriel Luiz de Souza Gomes

Nota de auto-avaliação: 10/10

## Apêndice

### Arquivos de Definição de Interface

Os principais arquivos de definição de interface protobuf são apresentados abaixo:

```protobuf
// ai_service.proto
syntax = "proto3";

package ai;

service AiService {
  rpc Predict (PredictRequest) returns (PredictResponse);
  rpc TrainModel (stream TrainingData) returns (TrainingStatus);
  rpc MonitorModel (ModelIdentifier) returns (stream ModelMetrics);
}

message PredictRequest {
  string input_data = 1;
  string model_id = 2;
}

message PredictResponse {
  string prediction = 1;
  float confidence = 2;
}

message TrainingData {
  string input = 1;
  string expected_output = 2;
}

message TrainingStatus {
  string model_id = 1;
  float accuracy = 2;
  int32 iterations = 3;
}

message ModelIdentifier {
  string model_id = 1;
}

message ModelMetrics {
  float current_accuracy = 1;
  int32 predictions_made = 2;
  float average_confidence = 3;
  string timestamp = 4;
}
```

```protobuf
// database_service.proto
syntax = "proto3";

package database;

service DatabaseService {
  rpc Create (CreateRequest) returns (CreateResponse);
  rpc Read (ReadRequest) returns (ReadResponse);
  rpc Update (UpdateRequest) returns (UpdateResponse);
  rpc Delete (DeleteRequest) returns (DeleteResponse);
  rpc Query (QueryRequest) returns (stream QueryResponse);
}

message CreateRequest {
  string collection = 1;
  string data = 2;
}

message CreateResponse {
  string id = 1;
  bool success = 2;
}

message ReadRequest {
  string collection = 1;
  string id = 2;
}

message ReadResponse {
  string data = 1;
}

message UpdateRequest {
  string collection = 1;
  string id = 2;
  string data = 3;
}

message UpdateResponse {
  bool success = 1;
}

message DeleteRequest {
  string collection = 1;
  string id = 2;
}

message DeleteResponse {
  bool success = 1;
}

message QueryRequest {
  string collection = 1;
  string query = 2;
}

message QueryResponse {
  string id = 1;
  string data = 2;
}
```

### Instruções Detalhadas para Execução

Para executar o sistema completo:

#### 1. Download do Arquivo de Máquinas Virtuais

Antes de começar, faça o download do arquivo contendo as máquinas virtuais através do link:
https://drive.google.com/file/d/1mamOkHO97KPbSRMZYQfiR1oHZsxvbnLb/view?usp=sharing

O arquivo está no formato tar.xz e contém todas as imagens e configurações das máquinas virtuais necessárias.

#### 2. Instalação das Ferramentas Necessárias

```bash
sudo apt update
sudo apt install qemu-kvm libvirt-daemon-system libvirt-clients bridge-utils
sudo systemctl enable libvirtd
sudo systemctl start libvirtd
```

#### 3. Preparação dos Arquivos

1. Descompacte o arquivo compactado:

   ```bash
   tar xf vm-export.tar.xz
   ```

2. Prepare o diretório para os discos:

   ```bash
   sudo mkdir -p /var/lib/libvirt/images/
   ```

3. Copie os arquivos QCOW2 para o diretório padrão:

   ```bash
   sudo cp vm-export/ai-server.qcow2 /var/lib/libvirt/images/
   sudo cp vm-export/database-server.qcow2 /var/lib/libvirt/images/
   sudo cp vm-export/web-server.qcow2 /var/lib/libvirt/images/
   ```

4. Ajuste as permissões:
   ```bash
   sudo chmod 640 /var/lib/libvirt/images/*.qcow2
   sudo chown libvirt-qemu:kvm /var/lib/libvirt/images/*.qcow2
   ```

#### 4. Importação das VMs

```bash
sudo virsh define vm-export/ai-server.xml
sudo virsh define vm-export/database-server.xml
sudo virsh define vm-export/web-server.xml
```

#### 5. Inicialização das VMs

É recomendado iniciar as VMs na seguinte ordem:

```bash
sudo virsh start database-server
sudo virsh start ai-server
sudo virsh start web-server
```

#### 6. Verificação do Status

Verifique se todas as VMs estão rodando:

```bash
sudo virsh list --all
```

#### 7. Conectando nas VMs

Para acessar o console de uma VM:

```bash
sudo virsh console nome-da-vm  # por exemplo: sudo virsh console ai-server
```

Para sair do console, utilize a combinação `Ctrl+]`.

#### 8. Verificando os IPs das VMs

```bash
sudo virsh domifaddr database-server
sudo virsh domifaddr ai-server
sudo virsh domifaddr web-server
```

#### 9. Acessando a Aplicação

Acesse a aplicação cliente através do navegador em:

```
http://[IP-da-VM-web]:8080
```

#### 10. Configurando Acesso Externo (Opcional)

Para permitir que outras máquinas na rede acessem o servidor web:

1. Instale o Nginx como proxy reverso no host:

   ```bash
   sudo apt update
   sudo apt install -y nginx
   ```

2. Crie um arquivo de configuração para o proxy:

   ```bash
   sudo nano /etc/nginx/sites-available/vm-proxy.conf
   ```

3. Adicione a seguinte configuração (substituindo pelo IP da sua VM web-server):

   ```
   server {
       listen 80;
       server_name localhost;

       location / {
           proxy_pass http://[IP-da-VM-web]:8080;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

4. Ative a configuração:

   ```bash
   sudo ln -sf /etc/nginx/sites-available/vm-proxy.conf /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

5. Verifique o IP da sua máquina host:

   ```bash
   hostname -I
   ```

6. Agora outras máquinas na mesma rede podem acessar o servidor web usando:
   ```
   http://[IP-DO-HOST]/
   ```
