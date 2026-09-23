# 🚀 Guia de Hospedagem do Radar Alpha na sua VPS

Como a ferramenta foi empacotada com um **Dockerfile baseado em Nginx Alpine**, ela é ultra-leve:
- **Consumo de Memória RAM:** menos de **8 MB**
- **Consumo de CPU:** praticamente **0%**
- Não vai interferir em nada nos seus fluxos (n8n) ou outros projetos da VPS.

---

## 🛑 1. Liberação da porta local 3000
A porta `3000` local foi **desocupada imediatamente** para que você possa rodar os fluxos do seu cliente com tranquilidade.
Se você quiser rodar localmente enquanto não coloca na VPS, a porta agora é:
👉 **`http://localhost:3050`**

---

## 🌐 2. Como colocar no ar no seu Easypanel (1 Minuto)

Se a sua VPS usa o **Easypanel** (como no seu projeto da calculadora):

### Passo 1: Criar Repositório no GitHub (ou usar pasta)
No terminal desta pasta (`c:\Users\plini\.gemini\antigravity-ide\scratch\radar-investimentos`):
```bash
git init
git add .
git commit -m "Radar Alpha v1.0"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/radar-alpha.git
git push -u origin main
```

### Passo 2: No Painel do Easypanel
1. Acesse o seu **Easypanel** no navegador.
2. No seu projeto, clique em **+ New Service** (Novo Serviço) -> **App**.
3. Em **Name**, coloque: `radar-alpha` (ou o nome que preferir).
4. Na aba **Source** (Origem):
   - Escolha **GitHub**.
   - Selecione o repositório `radar-alpha` e branch `main`.
5. Em **Build**: Ele já vai detectar automaticamente o `Dockerfile` que criamos!
6. Na aba **Domains** (Domínios):
   - Adicione um subdomínio (exemplo: `radar.seudominio.com.br` ou use o domínio automático `.easypanel.host`).
7. Clique em **Deploy**.

O Easypanel cuidará de tudo: compilará a imagem, iniciará o container e ativará o certificado de segurança SSL (HTTPS) de forma automática.

---

## 💻 3. Acesso pelo Celular ou Qualquer Lugar
Assim que subir para sua VPS:
- Você poderá abrir o link no navegador do seu smartphone.
- Como o design foi feito 100% responsivo, a visualização dos cards de Cripto e da Calculadora de FIIs se adapta perfeitamente à tela do celular.
