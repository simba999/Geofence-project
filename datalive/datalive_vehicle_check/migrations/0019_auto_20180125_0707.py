# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2018-01-25 07:07
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('datalive_cust_veh', '0056_auto_20180125_0707'),
        ('datalive_vehicle_check', '0018_auditsurveytemplate_is_default'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='damage',
            name='view',
        ),
        migrations.AddField(
            model_name='damage',
            name='schemantic',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='datalive_cust_veh.SchematicView'),
        ),
    ]