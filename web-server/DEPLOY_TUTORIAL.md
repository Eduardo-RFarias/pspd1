# Deploying Web Server on Alpine Linux VM

This tutorial will guide you through deploying the Web Server application on an Alpine Linux virtual machine using virt-manager.

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
   - Set hostname (e.g., `web-server`)
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
   apk add git openssh curl wget nginx
   ```
4. Install Go using the official method:

   ```
   # Download the latest Go release (adjust the version as needed)
   wget https://go.dev/dl/go1.24.2.linux-amd64.tar.gz

   # Extract it to /usr/local
   rm -rf /usr/local/go && tar -C /usr/local -xzf go1.24.2.linux-amd64.tar.gz

   # Add Go to the PATH
   echo 'export PATH=$PATH:/usr/local/go/bin' >> /root/.profile
   source /root/.profile

   # Verify Go installation
   go version
   ```

## 3. Deploy the Backend Application

### Copy Application Files

Option 1: Using SCP from host machine:

```
scp -r /path/to/web-server root@VM_IP_ADDRESS:/root/
```

Option 2: Clone from Git (if available):

```
git clone https://your-repository-url.git /root/web-server
```

### Configure the Application

1. Navigate to the application directory:

   ```
   cd /root/web-server
   ```

2. Create a `.env` file with required environment variables:

   ```
   touch .env
   echo "AI_SERVER_ADDR=ai_server_vm_ip:50051" >> .env
   echo "DB_SERVER_ADDR=db_server_vm_ip:50052" >> .env
   echo "HTTP_SERVER_ADDR=127.0.0.1:8080" >> .env
   ```

   Replace `ai_server_vm_ip` and `db_server_vm_ip` with the actual IP addresses of your AI server and database server VMs.

   Note: We set HTTP_SERVER_ADDR to 127.0.0.1:8080 to only listen on localhost, as nginx will proxy requests to it.

3. Create log directory:

   ```
   mkdir -p /var/log/web-server
   chmod 755 /var/log/web-server
   ```

4. Build the application:

   ```
   go build -o bin/web-server src/main.go
   ```

5. Test the application with explicit logging:

   ```
   ./bin/web-server > /var/log/web-server/output.log 2>&1
   ```

   Verify it starts without errors. Press Ctrl+C to stop.

## 4. Deploy the Frontend Application

1. Create a directory for the frontend:

   ```
   mkdir -p /var/www/html
   ```

2. Copy frontend files to the web server:
   Option 1: Using SCP from host machine:

   ```
   scp -r /path/to/frontend/* root@VM_IP_ADDRESS:/var/www/html/
   ```

   Option 2: Clone from Git (if available):

   ```
   git clone https://your-frontend-repository-url.git /tmp/frontend
   cp -r /tmp/frontend/dist/* /var/www/html/
   ```

## 5. Configure Nginx

1. Create an nginx configuration file:

   ```
   cat > /etc/nginx/http.d/default.conf << 'EOF'
   server {
       listen 80 default_server;
       listen [::]:80 default_server;

       root /var/www/html;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # API proxy to the Go backend - without trailing slash in proxy_pass
       location /api/ {
           proxy_pass http://127.0.0.1:8080;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   EOF
   ```

   Note: We removed the trailing slash from the proxy_pass URL to preserve the /api/ prefix when forwarding requests to the backend.

2. Test the nginx configuration:

   ```
   nginx -t
   ```

3. Start nginx and enable it on boot:
   ```
   rc-service nginx start
   rc-update add nginx default
   ```

## 6. Create Backend Service

1. Create an OpenRC service file:

   ```
   cat > /etc/init.d/web-server << 'EOF'
   #!/sbin/openrc-run

   name="web-server"
   description="Web Server Application"
   command="/root/web-server/bin/web-server"
   command_background=true
   pidfile="/run/${RC_SVCNAME}.pid"
   directory="/root/web-server"
   output_log="/var/log/web-server/output.log"
   error_log="/var/log/web-server/error.log"
   depend() {
       need net
   }
   EOF
   ```

2. Make the service executable and add it to startup:

   ```
   chmod +x /etc/init.d/web-server
   rc-update add web-server default
   ```

3. Start the service:
   ```
   rc-service web-server start
   ```

## 7. Configure Network Access

1. Install and configure firewall:

   ```
   apk add iptables
   ```

2. Allow access to the HTTP port:

   ```
   iptables -A INPUT -p tcp --dport 80 -j ACCEPT
   ```

3. Save the rules and enable iptables at startup:
   ```
   /etc/init.d/iptables save
   rc-update add iptables default
   ```

## 8. Verify Deployment

1. From your host machine, test the frontend in a browser:
   ```
   http://VM_IP_ADDRESS/
   ```
2. Test the API:
   ```
   curl http://VM_IP_ADDRESS/api/health
   ```

## Troubleshooting

### Logs and Status

- Check nginx status: `rc-service nginx status`
- Check backend service status: `rc-service web-server status`
- View nginx logs: `tail -f /var/log/nginx/error.log`
- View nginx access logs: `tail -f /var/log/nginx/access.log`
- View backend logs:
  ```
  tail -f /var/log/web-server/output.log
  tail -f /var/log/web-server/error.log
  ```

### For 500 Internal Server Errors

1. Check if backend is running: `ps aux | grep web-server`
2. Verify connectivity to dependent services:
   ```
   ping ai_server_vm_ip
   ping db_server_vm_ip
   telnet ai_server_vm_ip 50051
   telnet db_server_vm_ip 50052
   ```
3. Run the server in foreground to see immediate errors:
   ```
   cd /root/web-server
   rc-service web-server stop
   ./bin/web-server
   ```
4. Check environment variables are properly set:
   ```
   cat /root/web-server/.env
   ```
5. Check permissions for log files:
   ```
   ls -la /var/log/web-server
   chown -R root:root /var/log/web-server
   chmod -R 755 /var/log/web-server
   ```
6. Ensure dependencies are running and accessible:
   - AI Server must be running on the specified address
   - Database Server must be running on the specified address

### Other Issues

- Check if ports are open:
  ```
  netstat -tuln | grep 80
  netstat -tuln | grep 8080
  ```
- Verify VM is accessible from host: `ping VM_IP_ADDRESS`
- If the frontend doesn't load properly, check nginx permissions: `chmod -R 755 /var/www/html`
- If API 404 errors persist, try these solutions:
  - Make sure your Go API routes are prefixed with "/api" to match the nginx location
  - Or create a dedicated location in nginx without the trailing slash in location:
    ```
    location /api {
        proxy_pass http://127.0.0.1:8080/api;
        # other proxy settings...
    }
    ```

## Notes

- This setup serves a frontend application at the root URL and proxies API requests to the Go backend
- The backend connects to both the AI server and database server
- For production use, consider setting up HTTPS using Let's Encrypt (certbot)
- Consider setting up monitoring and automatic restart in case of failures

## 9. Exporting and Importing VMs

Once you have set up all three VMs (web-server, ai-server, and database-server), you can export them for use on another computer.

### Exporting VMs

1. Shut down the VMs:

   ```
   # For each VM
   sudo virsh shutdown VM_NAME
   ```

2. Export each VM using virt-manager or virsh:

   **Option 1: Using virt-manager GUI**

   1. Open virt-manager
   2. Right-click on the VM and select "Clone..."
   3. In the clone dialog, select "Clone storage with VM" option
   4. Choose "File" for storage format
   5. Specify a location to save the VM files
   6. Click "Clone" to start the process

   **Option 2: Using virsh commands**

   1. Export the VM definition:

      ```
      sudo virsh dumpxml VM_NAME > VM_NAME.xml
      ```

   2. Find the disk path:

      ```
      sudo virsh domblklist VM_NAME
      ```

   3. Copy the disk image:

      ```
      sudo cp /path/to/disk/image VM_NAME.qcow2
      ```

   4. Create a package with both files:
      ```
      tar -czvf VM_NAME-export.tar.gz VM_NAME.xml VM_NAME.qcow2
      ```

3. Repeat the export process for all three VMs:
   - web-server
   - ai-server
   - database-server

### Importing VMs

On the new computer:

1. Install virt-manager and KVM:

   ```
   sudo apt-get install virt-manager qemu-kvm libvirt-daemon-system
   # or for Fedora/RHEL/CentOS
   sudo dnf install virt-manager qemu-kvm libvirt
   ```

2. Copy the exported VM files to the new machine.

3. Import each VM:

   **Option 1: Using virt-manager GUI**

   1. Open virt-manager
   2. Click "File" > "Import existing disk image"
   3. Browse to the disk image file
   4. Configure VM settings (name, memory, CPUs)
   5. Complete the import process

   **Option 2: Using virsh commands**

   1. Extract the package:

      ```
      tar -xzvf VM_NAME-export.tar.gz
      ```

   2. Copy the disk image to the libvirt storage location:

      ```
      sudo cp VM_NAME.qcow2 /var/lib/libvirt/images/
      ```

   3. Edit the XML file to update the disk path to match the new location

   4. Define the VM:
      ```
      sudo virsh define VM_NAME.xml
      ```

4. After importing all VMs, start them in this order:

   1. First, start the database-server VM:

      ```
      sudo virsh start database-server
      ```

   2. Then, start the ai-server VM:

      ```
      sudo virsh start ai-server
      ```

   3. Finally, start the web-server VM:
      ```
      sudo virsh start web-server
      ```

5. Find the IP address of the web-server VM:

   ```
   sudo virsh domifaddr web-server
   ```

6. Access the web application by opening a browser and navigating to the web-server IP:
   ```
   http://web-server-ip-address/
   ```

### Networking Considerations

If the VMs use static IP addresses in their configuration:

1. You may need to update the `.env` files on both the web-server and database-server to match the new IP addresses:

   ```
   # On web-server VM
   vim /root/web-server/.env
   # Update AI_SERVER_ADDR and DB_SERVER_ADDR

   # Restart the service
   rc-service web-server restart
   ```

2. Alternatively, consider setting up a host-only network in virt-manager:
   1. Create a new virtual network in virt-manager
   2. Configure all VMs to use this network
   3. Assign static IPs to each VM within this private network
