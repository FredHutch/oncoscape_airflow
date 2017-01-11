#!/usr/bin/python
import airflow
from airflow import models, settings
from airflow.contrib.auth.backends.password_auth import PasswordUser
user = PasswordUser(models.User())
user.username = 'admin'
user.email = 'admin@fredhutch.org'
user.password = 'Airflow123'
session = settings.Session()
session.add(user)
session.commit()
session.close()
