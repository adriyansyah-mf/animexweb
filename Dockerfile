# Menggunakan image Node.js sebagai base image
FROM node:18-alpine

# Menentukan direktori kerja di dalam container
WORKDIR /app

# Menyalin package.json dan package-lock.json terlebih dahulu untuk menginstal dependensi
COPY package.json package-lock.json ./

# Menginstal dependensi proyek
RUN npm install

# Menyalin seluruh kode sumber ke dalam container
COPY . .

# Menjalankan build aplikasi Next.js
RUN npm run build

# Mengexpose port 80 yang akan digunakan oleh aplikasi
EXPOSE 80

# Menentukan perintah untuk menjalankan aplikasi dalam mode produksi
CMD ["npm", "run", "start"]
