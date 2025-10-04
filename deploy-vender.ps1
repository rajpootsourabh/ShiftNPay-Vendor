# ------------------------------
# ShiftNPay Vender Deployment Trigger (local)
# ------------------------------

$server = "root@45.77.166.189"

Write-Host "Starting remote deployment..."
ssh $server "bash -l -c '/var/www/vender/deploy.sh'"
Write-Host "Deployment process finished."
