#!/bin/bash
cd /home/davir/Projetos/extensionista/api
./mvnw clean test > /tmp/maven_test_output.log 2>&1
echo "Exit code: $?" >> /tmp/maven_test_output.log