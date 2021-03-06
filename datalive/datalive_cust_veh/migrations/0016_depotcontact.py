# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2017-12-03 08:47
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('datalive_cust_veh', '0015_merge_20171128_1031'),
    ]

    operations = [
        migrations.CreateModel(
            name='DepotContact',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('creation_datetime', models.DateTimeField(auto_now_add=True)),
                ('name', models.CharField(db_index=True, max_length=200)),
                ('email', models.EmailField(max_length=256)),
                ('web_url', models.URLField(max_length=256)),
                ('phone1', models.CharField(blank=True, max_length=256, null=True)),
                ('phone2', models.CharField(blank=True, max_length=256, null=True)),
                ('address1', models.CharField(blank=True, max_length=1024, null=True)),
                ('address2', models.CharField(blank=True, max_length=256, null=True)),
                ('city', models.CharField(blank=True, max_length=256, null=True)),
                ('county', models.CharField(blank=True, max_length=256, null=True)),
                ('postcode', models.CharField(blank=True, max_length=20, null=True)),
                ('country', models.CharField(blank=True, max_length=100, null=True)),
                ('is_maintenance_control', models.BooleanField(default=False)),
                ('customer', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='datalive_cust_veh.Customer')),
            ],
        ),
    ]
