@echo off
cd backend
vendor\bin\pint routes/api.php app database
cd ..
pause