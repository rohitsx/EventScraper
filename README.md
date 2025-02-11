# [EventScraper](https://eventscraper.devrohit.tech/)

 **Live Link:** [EventScraper](https://eventscraper.devrohit.tech/)  
 **Project Summary:** [Google Docs](https://docs.google.com/document/d/1unbaJxmWy2PyOHs4rkptRoYYg1GKlgABp4r_P8YEsyY/edit?usp=sharing)  

## Setup Instructions  

### Server Setup  

```bash
cd EventScraper/server
//add key.json from Vertex Ai
docker-compose up -d
```


### clinet setup 

```bash
cd EventScraper/client
//add .env for client VITE_API=http://localhost:3001/api
pnpm i
dev: pnpm run dev
build: pnpm run build
```
