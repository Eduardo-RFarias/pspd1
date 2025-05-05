# Deploying AI Server on Alpine Linux VM

This tutorial will guide you through deploying the AI Server application on an Alpine Linux virtual machine using virt-manager.

## Prerequisites

- virt-manager installed on your host system
- Alpine Linux ISO downloaded from [Alpine Linux website](https://alpinelinux.org/downloads/)

## 1. Create and Configure Alpine Linux VM

### Create the VM

1. Open virt-manager: `sudo virt-manager`
2. Click "Create a new virtual machine"
3. Select "Local install media" and browse to your Alpine Linux ISO
4. Configure VM resources:
   - Memory: 2GB (minimum recommended)
   - CPUs: 2 (minimum recommended)
   - Storage: At least 10GB
5. For networking, select "Bridged network" to allow access from host machine
6. Complete the creation wizard

### Install Alpine Linux

1. Start the VM and wait for Alpine to boot
2. Log in with username `root` (no password)
3. Run the setup script:
   ```
   setup-alpine
   ```
4. Follow the prompts:
   - Set keyboard layout
   - Set hostname (e.g., `ai-server`)
   - Set up root password
   - For disk setup, choose `sys` mode for persistent installation
   - For the disk, select your virtual disk (usually `vda`)
   - For network, configure with DHCP or a static IP (note the IP for later use)
5. After installation completes, run:
   ```
   reboot
   ```

## 2. Set Up the Application Environment

1. Log in as root with the password you created
2. Update package repositories:
   ```
   apk update
   apk upgrade
   ```
3. Install required packages:
   ```
   apk add python3 py3-pip git openssh curl
   ```
4. Install pipx:
   ```
   pip3 install --user pipx
   export PATH="$PATH:/root/.local/bin"
   echo 'export PATH="$PATH:/root/.local/bin"' >> /root/.profile
   ```
5. Install Poetry:
   ```
   pipx install poetry
   ```

## 3. Deploy the Application

### Copy Application Files

Option 1: Using SCP from host machine:

```
scp -r /path/to/ai-server root@VM_IP_ADDRESS:/root/
```

Option 2: Clone from Git (if available):

```
git clone https://your-repository-url.git /root/ai-server
```

### Configure the Application

1. Navigate to the application directory:

   ```
   cd /root/ai-server
   ```

2. Create a `.env` file with required environment variables:

   ```
   touch .env
   echo "OPENAI_API_KEY=your_openai_api_key" >> .env
   echo "GRPC_PORT=50051" >> .env
   echo "LOG_LEVEL=INFO" >> .env
   ```

3. Install dependencies:

   ```
   poetry install
   ```

4. Test the application:
   ```
   poetry run python main.py
   ```
   Verify it starts without errors. Press Ctrl+C to stop.

## 4. Create Startup Service

1. Create an OpenRC service file:

   ```
   cat > /etc/init.d/ai-server << 'EOF'
   #!/sbin/openrc-run

   name="ai-server"
   description="AI Server Application"
   command="/root/.local/bin/poetry"
   command_args="run python main.py"
   command_background=true
   pidfile="/run/${RC_SVCNAME}.pid"
   directory="/root/ai-server"
   depend() {
       need net
   }
   EOF
   ```

2. Make the service executable and add it to startup:

   ```
   chmod +x /etc/init.d/ai-server
   rc-update add ai-server default
   ```

3. Start the service:
   ```
   rc-service ai-server start
   ```

## 5. Configure Network Access

1. Install and configure firewall:

   ```
   apk add iptables
   ```

2. Allow access to the gRPC port:

   ```
   iptables -A INPUT -p tcp --dport 50051 -j ACCEPT
   ```

3. Save the rules and enable iptables at startup:
   ```
   /etc/init.d/iptables save
   rc-update add iptables default
   ```

## 6. Verify Deployment

1. From your host machine, use a gRPC client to test the connection:

   ```
   grpcurl -plaintext VM_IP_ADDRESS:50051 list
   ```

2. You should see the available gRPC services listed.

## Troubleshooting

- Check service status: `rc-service ai-server status`
- View logs: `tail -f /var/log/messages`
- Check if port is open: `netstat -tuln | grep 50051`
- Verify VM is accessible from host: `ping VM_IP_ADDRESS`

## Notes

- The application requires an OpenAI API key to function properly
- For production use, consider setting up HTTPS/TLS for the gRPC server
- Consider setting up monitoring and automatic restart in case of failures
