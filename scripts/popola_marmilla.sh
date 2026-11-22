#!/bin/bash
# Popola Marmilla — nessuna dipendenza, solo curl
# Uso: bash scripts/popola_marmilla.sh

BASE="http://localhost:8000"
EMAIL="cescopintus@gmail.com"
read -s -p "Password YTT: " PASS; echo

echo "Login..."
TOKEN=$(curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" | \
  grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then echo "ERRORE: login fallito."; exit 1; fi
echo "Login OK"

AUTH="Authorization: Bearer $TOKEN"
CT="Content-Type: application/json"

post() {
  curl -s -X POST "$BASE$1" -H "$AUTH" -H "$CT" -d "$2"
  echo ""
}

# --- Territorio ---
echo "Creo territorio Marmilla..."
TID=$(post "/territories/" '{
  "name":"Marmilla","slug":"marmilla",
  "description":"Altopiano basaltico tra nuraghi UNESCO e cavalli selvatici. La Marmilla custodisce Su Nuraxi di Barumini, la Giara di Gesturi e borghi medievali sospesi nella pietra.",
  "lat":39.70,"lng":8.95,"zoom_level":11,"level":2,"is_published":true
}' | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Territorio ID: $TID"

echo "Creo luoghi..."

post "/places/" "{
  \"name\":\"Su Nuraxi di Barumini\",\"slug\":\"su-nuraxi-barumini\",
  \"description\":\"Il nuraghe piu celebre della Sardegna, Patrimonio UNESCO dal 1997. Costruito tra il 1500 e il 500 a.C., il complesso include la torre centrale, quattro bastioni e il villaggio nuragico.\",
  \"place_type\":\"cultural_site\",\"territory_id\":\"$TID\",
  \"lat\":39.7023,\"lng\":8.9910,\"is_published\":true
}" > /dev/null && echo "v Su Nuraxi di Barumini"

post "/places/" "{
  \"name\":\"Giara di Gesturi\",\"slug\":\"giara-di-gesturi\",
  \"description\":\"Un altopiano basaltico a 600 metri di quota. Qui vivono in liberta i cavallini della Giara, una razza equina endemica sarda. Pozze d'acqua stagionali, boschi di lecci e sentieri silenziosi.\",
  \"place_type\":\"natural_area\",\"territory_id\":\"$TID\",
  \"lat\":39.7467,\"lng\":8.9700,\"is_published\":true
}" > /dev/null && echo "v Giara di Gesturi"

post "/places/" "{
  \"name\":\"Las Plassas\",\"slug\":\"las-plassas\",
  \"description\":\"Un colle conico solitario nel mezzo della pianura, coronato dai resti di un castello medievale del XII secolo. Dal borgo si domina tutta la Marmilla con una vista a 360 gradi.\",
  \"place_type\":\"village\",\"territory_id\":\"$TID\",
  \"lat\":39.6833,\"lng\":8.9500,\"is_published\":true
}" > /dev/null && echo "v Las Plassas"

post "/places/" "{
  \"name\":\"Laconi e il Parco dei Menhir\",\"slug\":\"laconi-parco-menhir\",
  \"description\":\"Laconi custodisce il museo delle statue menhir piu importante della Sardegna. Il parco pubblico attorno al castello medievale ha cascate, grotte e un'atmosfera romantica fuori dal tempo.\",
  \"place_type\":\"cultural_site\",\"territory_id\":\"$TID\",
  \"lat\":39.8577,\"lng\":9.0526,\"is_published\":true
}" > /dev/null && echo "v Laconi e il Parco dei Menhir"

post "/places/" "{
  \"name\":\"Sanluri\",\"slug\":\"sanluri\",
  \"description\":\"Sanluri ospita l'unico castello medievale ancora abitato della Sardegna, Castello Eleonora d'Arborea, con un museo con oltre 20.000 cimeli storici.\",
  \"place_type\":\"village\",\"territory_id\":\"$TID\",
  \"lat\":39.5623,\"lng\":8.8961,\"is_published\":true
}" > /dev/null && echo "v Sanluri"

echo "Creo operatori..."

post "/operators/" "{
  \"name\":\"Fondazione Barumini Sistema Cultura\",\"slug\":\"fondazione-barumini\",
  \"description\":\"Gestisce il sito UNESCO di Su Nuraxi e il Centro Giovanni Lilliu. Organizza visite guidate, mostre e attivita didattiche.\",
  \"operator_type\":\"museum\",\"territory_id\":\"$TID\",
  \"website\":\"https://www.barumini.it\",\"is_published\":true
}" > /dev/null && echo "v Fondazione Barumini Sistema Cultura"

post "/operators/" "{
  \"name\":\"Cooperativa Giara\",\"slug\":\"cooperativa-giara\",
  \"description\":\"Guide naturalistiche specializzate nell'altopiano della Giara. Escursioni a piedi e a cavallo per osservare i cavallini selvatici, birdwatching e trekking notturno.\",
  \"operator_type\":\"experience\",\"territory_id\":\"$TID\",\"is_published\":true
}" > /dev/null && echo "v Cooperativa Giara"

post "/operators/" "{
  \"name\":\"Museo delle Statue Menhir di Laconi\",\"slug\":\"museo-menhir-laconi\",
  \"description\":\"Custodisce la piu grande collezione al mondo di statue menhir della cultura di Ozieri. Figure antropomorfe in basalto locale, uniche nella preistoria mediterranea.\",
  \"operator_type\":\"museum\",\"territory_id\":\"$TID\",
  \"website\":\"https://www.museomenhir.it\",\"is_published\":true
}" > /dev/null && echo "v Museo delle Statue Menhir di Laconi"

echo "Creo racconto..."
post "/stories/" "{
  \"title\":\"Tra cavalli selvatici e torri nuragiche: la Marmilla rivela la Sardegna autentica\",
  \"slug\":\"marmilla-cavalli-nuraghi\",
  \"body\":\"La Marmilla e uno dei luoghi piu silenziosi della Sardegna, e in quel silenzio si sente tutto.\\n\\nA Barumini c'e un nuraghe che ha 3500 anni e che ha cambiato il modo in cui il mondo guarda alla preistoria sarda. Giovanni Lilliu lo ha scavato negli anni Cinquanta tra l'incredulita degli esperti internazionali: una torre centrale di diciotto metri, quattro bastioni, un villaggio di capanne intorno. Era una civilta, non un accampamento. Dal 1997 e Patrimonio UNESCO.\\n\\nA pochi chilometri a nord, l'altopiano basaltico della Giara si alza improvvisamente dal paesaggio piatto. Sopra, 45 chilometri quadrati di bosco, stagni e silenzio. I cavallini ci sono sempre stati, una razza endemica che nessuno possiede e nessuno cavalca. Si avvicinano alle pozze d'acqua all'alba e al tramonto. Se sai aspettare, arrivano.\\n\\nIl colle di Las Plassas si vede da lontano: conico, solitario, con il castello in cima come una corona rotta. Il paese sotto ha ottanta abitanti. Solo una salita, una vista che toglie il respiro e la sensazione di essere arrivati da qualche parte.\",
  \"excerpt\":\"Un altopiano con cavalli liberi, un nuraghe UNESCO e borghi medievali sospesi nel tempo. La Marmilla e la Sardegna che non si mette in posa.\",
  \"territory_id\":\"$TID\",
  \"tags\":\"marmilla,nuraghi,giara,sardegna,patrimonio-unesco\",
  \"status\":\"published\"
}" > /dev/null && echo "v Racconto creato"

echo ""
echo "Marmilla popolata: 5 luoghi, 3 operatori, 1 racconto."
