# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2017-11-23 21:06
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('datalive_cust_veh', '0008_auto_20171123_0844'),
    ]

    operations = [
        migrations.AddField(
            model_name='liveryview',
            name='view_name',
            field=models.CharField(max_length=100, null=True),
        ),
    ]