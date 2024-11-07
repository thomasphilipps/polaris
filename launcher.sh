#!/bin/bash

# Lancer docker-compose avec le fichier d'environnement spécifié
docker-compose --env-file .env.local up -d

# Attendre que le conteneur ait fini de démarrer en recherchant le message de démarrage
echo "Attente que le conteneur termine l'initialisation..."
until docker-compose logs foundry | grep -q "Created client session"; do
    sleep 1
done
echo "Le conteneur est complètement démarré."

# Changer les permissions à l'intérieur du conteneur après le démarrage
docker exec -it polaris-foundry-1 chown -R foundry:foundry /data/Data
echo "Permissions du dossier /data/Data dans le conteneur changées avec succès."

# Changer les permissions du dossier spécifié
echo "Changement des permissions sur le dossier ./dist/Data/"
sudo chown -R 1000:1000 ./dist/Data
echo "Permissions changées avec succès."
