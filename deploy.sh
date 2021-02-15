sudo sed -i 's/127.0.0.53/8.8.8.8/g' /etc/resolv.conf
sudo pm2 stop server
sudo pm2 delete server
redis-cli shutdown
cd ~
rm -rf LMS
git clone https://github.com/ejekanshjain/LMS.git
cp config.env LMS/.env
cd LMS
chmod 777 uploads
npm install
redis-server --save "" --appendonly no --daemonize yes
sudo pm2 start server.js --no-autorestart