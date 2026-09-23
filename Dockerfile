FROM nginx:alpine

# Configuração otimizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Arquivos da aplicação
COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY js /usr/share/nginx/html/js

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
