FROM node:18-alpine

WORKDIR /app

# Сначала копируем только package.json (для кэширования зависимостей)
COPY package.json ./

# Проверяем, что файл не пустой
RUN if [ ! -s package.json ]; then echo "Error: package.json is empty" && exit 1; fi

# Устанавливаем зависимости
RUN npm install

# Копируем остальной код
COPY . .

EXPOSE 3000

CMD ["npm", "start"]