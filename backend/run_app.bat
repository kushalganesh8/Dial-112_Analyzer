@echo off
REM Activate the virtual environment
call myenv\Scripts\activate

REM Run the FastAPI app with uvicorn
uvicorn main:app --port 8007 --reload

REM Pause to keep the window open after execution
pause