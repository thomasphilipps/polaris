#!/bin/bash

# Lancer docker-compose avec le fichier d'environnement spécifié
docker-compose --env-file .env.local up -d

# Attendre que le conteneur ait fini de démarrer en recherchant le message de démarrage
echo "Attente que le conteneur termine l'initialisation..."
until docker-compose logs foundry | grep -q "Server started and listening on port"; do
    sleep 1
done
echo "Le conteneur est complètement démarré."

# Changer les permissions du dossier spécifié
echo "Changement des permissions sur le dossier ./dist/Data/systems/polaris"
sudo chown -R 1000:1000 ./dist/Data/systems/polaris
echo "Permissions changées avec succès."
