#!/bin/bash
# Popola Citta Metropolitana di Sassari — nessuna dipendenza, solo curl
# Uso: bash scripts/popola_sassarese.sh

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
echo "Creo territorio Sassarese..."
TID=$(post "/territories/" '{
  "name":"Citta Metropolitana di Sassari","slug":"sassarese",
  "description":"Il nord-ovest della Sardegna e una sintesi di identita diverse: Alghero con il suo cuore catalano, Castelsardo medievale sul mare, la spiaggia bianca della Pelosa, l isola dell Asinara dimenticata dal tempo.",
  "lat":40.75,"lng":8.65,"zoom_level":10,"level":2,"is_published":true
}' | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Territorio ID: $TID"

echo "Creo luoghi..."

post "/places/" "{
  \"name\":\"Alghero\",\"slug\":\"alghero\",
  \"description\":\"L'unica citta catalana d'Italia. Le mura medievali sul Mediterraneo, i vicoli del centro storico dove ancora si parla algherese e il corallo rosso lavorato da secoli.\",
  \"place_type\":\"village\",\"territory_id\":\"$TID\",
  \"lat\":40.5588,\"lng\":8.3195,\"is_published\":true
}" > /dev/null && echo "v Alghero"

post "/places/" "{
  \"name\":\"Castelsardo\",\"slug\":\"castelsardo\",
  \"description\":\"Un borgo medievale che sembra disegnato: strade strette che salgono verso il castello dei Doria, case color ocra aggrapate alla roccia, il mare blu sotto.\",
  \"place_type\":\"village\",\"territory_id\":\"$TID\",
  \"lat\":40.9174,\"lng\":8.7119,\"is_published\":true
}" > /dev/null && echo "v Castelsardo"

post "/places/" "{
  \"name\":\"Spiaggia della Pelosa\",\"slug\":\"spiaggia-pelosa-stintino\",
  \"description\":\"Sabbia bianca finissima, acqua turchese trasparente, la torre aragonese in mezzo al mare e l'Asinara sullo sfondo. Una delle spiagge piu belle del Mediterraneo.\",
  \"place_type\":\"natural_area\",\"territory_id\":\"$TID\",
  \"lat\":40.9533,\"lng\":8.1811,\"is_published\":true
}" > /dev/null && echo "v Spiaggia della Pelosa"

post "/places/" "{
  \"name\":\"Isola dell Asinara\",\"slug\":\"isola-asinara\",
  \"description\":\"Ex carcere di massima sicurezza ora parco nazionale. Strade deserte, macchia mediterranea, asini bianchi albini. Si visita solo con guide autorizzate del parco.\",
  \"place_type\":\"natural_area\",\"territory_id\":\"$TID\",
  \"lat\":41.0742,\"lng\":8.2286,\"is_published\":true
}" > /dev/null && echo "v Isola dell Asinara"

post "/places/" "{
  \"name\":\"Sassari\",\"slug\":\"sassari\",
  \"description\":\"La seconda citta della Sardegna: corso liberty, Piazza d'Italia monumentale, Museo Nazionale Sanna. Citta della Cavalcata Sarda e della Faradda dei Candelieri.\",
  \"place_type\":\"cultural_site\",\"territory_id\":\"$TID\",
  \"lat\":40.7259,\"lng\":8.5557,\"is_published\":true
}" > /dev/null && echo "v Sassari"

post "/places/" "{
  \"name\":\"Grotte di Nettuno\",\"slug\":\"grotte-nettuno\",
  \"description\":\"Accessibili via mare da Alghero o scendendo i 654 gradini della Escala del Cabirol. Stalattiti, stalagmiti, un lago sotterraneo e un percorso illuminato di 200 metri.\",
  \"place_type\":\"natural_area\",\"territory_id\":\"$TID\",
  \"lat\":40.5667,\"lng\":8.1611,\"is_published\":true
}" > /dev/null && echo "v Grotte di Nettuno"

echo "Creo operatori..."

post "/operators/" "{
  \"name\":\"Parco Nazionale dell Asinara\",\"slug\":\"parco-asinara\",
  \"description\":\"Gestisce gli accessi e le escursioni sull'isola. Tour in jeep, bici, a piedi e in kayak. L'unico modo legale per visitare l'Asinara.\",
  \"operator_type\":\"experience\",\"territory_id\":\"$TID\",
  \"website\":\"https://www.parcoasinara.org\",\"is_published\":true
}" > /dev/null && echo "v Parco Nazionale dell Asinara"

post "/operators/" "{
  \"name\":\"Naviargo Alghero\",\"slug\":\"naviargo-alghero\",
  \"description\":\"Gite in barca verso Capo Caccia, le Grotte di Nettuno e le calette della costa catalana. Tour snorkeling e noleggio gommoni.\",
  \"operator_type\":\"experience\",\"territory_id\":\"$TID\",\"is_published\":true
}" > /dev/null && echo "v Naviargo Alghero"

post "/operators/" "{
  \"name\":\"Cooperativa Pescatori di Stintino\",\"slug\":\"cooperativa-pescatori-stintino\",
  \"description\":\"Stintino e nata come borgo di pescatori nel 1885. La cooperativa mantiene viva quella tradizione: tonno, aragosta, ostriche e pesce fresco dalla tonnara locale.\",
  \"operator_type\":\"food_producer\",\"territory_id\":\"$TID\",\"is_published\":true
}" > /dev/null && echo "v Cooperativa Pescatori di Stintino"

post "/operators/" "{
  \"name\":\"Museo del Corallo di Alghero\",\"slug\":\"museo-corallo-alghero\",
  \"description\":\"Il corallo rosso del Mar di Sardegna e lavorato ad Alghero da secoli. Il museo racconta la storia della pesca al corallo e la tradizione orafa locale.\",
  \"operator_type\":\"museum\",\"territory_id\":\"$TID\",\"is_published\":true
}" > /dev/null && echo "v Museo del Corallo di Alghero"

echo "Creo racconto..."
post "/stories/" "{
  \"title\":\"Da Alghero all Asinara: il nord-ovest sardo tra storia catalana e natura selvaggia\",
  \"slug\":\"sassarese-alghero-asinara\",
  \"body\":\"C'e un punto dal Bastione Marco Polo di Alghero in cui il sole tramonta esattamente sull'orizzonte del mare e le mura medievali diventano arancioni. I pescatori di corallo lo hanno visto ogni sera per secoli, prima in catalano, poi in italiano.\\n\\nAlghero e una delle poche citta sarde con un identita urbana forte: centro storico dentro le mura, una passeggiata sul mare, ristoranti di qualita. La stratificazione e la cosa piu interessante: l'architettura aragonese, il dialetto catalano, la tradizione corallina.\\n\\nA un'ora verso est, Castelsardo e il contrario: raccolta, arroccata. Ci si arriva, si parcheggia fuori e si sale a piedi attraverso vicoli sempre piu stretti. In mezzo alla salita, donne anziane che intrecciano la palma nana fuori dalle porte di casa.\\n\\nLa Pelosa e famosa e affollata d'estate. Ma presa al momento giusto, settembre, l'alba, e esattamente quello che sembra nelle foto. L'Asinara e dietro: ex carcere di massima sicurezza, ora una delle isole piu selvagge del Mediterraneo.\",
  \"excerpt\":\"Mura medievali catalane, corallo rosso, una spiaggia bianca da cartolina e un'isola carcere diventata paradiso naturale. Il sassarese sorprende.\",
  \"territory_id\":\"$TID\",
  \"tags\":\"sassari,alghero,asinara,pelosa,sardegna,corallo\",
  \"status\":\"published\"
}" > /dev/null && echo "v Racconto creato"

echo ""
echo "Sassarese popolato: 6 luoghi, 4 operatori, 1 racconto."
