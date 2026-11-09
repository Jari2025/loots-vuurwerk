# Account- en MongoDB-configuratie

De accountpagina gebruikt Vercel Functions en MongoDB Atlas. Registratie vraagt om naam, e-mailadres, telefoonnummer en wachtwoord. E-mailverificatie is niet ingeschakeld. Wachtwoorden worden gehasht opgeslagen; aanmelden werkt via een beveiligde, HttpOnly-sessiecookie.

## Vercel-omgevingsvariabelen

Voeg in Vercel bij **Project Settings → Environment Variables** deze variabelen toe voor de omgevingen die je gebruikt:

- `MONGODB_URI`: de Atlas-verbindingsstring; houd deze geheim.
- `MONGODB_DB`: `loots-vuurwerk` (of een andere databasenaam).
- `SESSION_SECRET`: een willekeurige geheime waarde van minimaal 32 bytes.

Genereer bijvoorbeeld een sessiegeheim lokaal met `openssl rand -base64 48`. Zet de echte waarden niet in websitebestanden, Git of chatberichten. `.env.example` bevat alleen de namen van de benodigde variabelen.

## MongoDB Atlas

Maak in Atlas een databasegebruiker aan met alleen lees- en schrijfrechten op de database voor deze site. Vercel Functions gebruiken niet noodzakelijk een vast uitgaand IP-adres. Beperk de Atlas Network Access-regel waar mogelijk tot de vaste egress-IP's van je Vercel-configuratie. Als dat voor je Vercel-plan niet beschikbaar is, is `0.0.0.0/0` een ruimere netwerkregel; gebruik die alleen met een sterk databasewachtwoord en een databasegebruiker met beperkte rechten.

Na het invullen van de omgevingsvariabelen moet je de Vercel-deployment opnieuw uitvoeren. De account-API staat onder `/api/account/`.

## Huidige scope

Account aanmaken, inloggen, profiel ophalen en uitloggen zijn geïmplementeerd. De huidige site bevat categorieën, maar nog geen afzonderlijke productcatalogus; producten opslaan in een verlanglijst volgt zodra die catalogus beschikbaar is.
