# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2018-01-06 20:35
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('datalive_cust_veh', '0045_vehicle_service_due_odo'),
    ]

    operations = [
        migrations.AddField(
            model_name='vehicle',
            name='gross_vehicle_weight',
            field=models.FloatField(blank=True, max_length=10, null=True),
        ),
        migrations.AlterField(
            model_name='vehicle',
            name='load_capacity',
            field=models.FloatField(blank=True, default=0.0, max_length=10, null=True),
        ),
        migrations.AlterField(
            model_name='vehicle',
            name='trackers',
            field=models.ManyToManyField(blank=True, to='datalive_cust_veh.VehicleTracker'),
        ),
    ]
