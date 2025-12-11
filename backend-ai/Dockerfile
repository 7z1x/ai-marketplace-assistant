# Gunakan image Python yang ringan
FROM python:3.11-slim

# Set folder kerja di dalam container
WORKDIR /app

# Salin requirements dan install library
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Salin sisa kode (main.py, .env, dll)
COPY . .

# Beri tahu Docker port yang dipakai
EXPOSE 8001

# Perintah untuk menjalankan server
CMD ["python", "main.py"]