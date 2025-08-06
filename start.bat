@echo off
echo 正在启动合同生成系统...
echo.
echo 请选择启动方式：
echo 1. 直接使用浏览器打开（推荐）
echo 2. 启动后端服务（需要Python环境）
echo.

set /p choice=请输入选择(1或2)：

if "%choice%"=="1" (
    echo 正在打开合同生成系统...
    start index.html
    echo 系统已打开，请在浏览器中使用！
) else if "%choice%"=="2" (
    echo 正在检查Python环境...
    python --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo 错误：未检测到Python环境，请先安装Python！
        pause
        exit /b
    )
    
    echo 正在安装依赖...
    pip install -r requirements.txt
    
    echo 正在启动后端服务...
    echo 服务启动后，请在浏览器中访问：http://localhost:5000
    echo 按Ctrl+C停止服务
    python app.py
) else (
    echo 无效选择，请重新运行并输入1或2
)

pause