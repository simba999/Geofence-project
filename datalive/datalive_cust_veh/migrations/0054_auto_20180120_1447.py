# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2018-01-20 09:17
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('datalive_cust_veh', '0053_leasecompany_customer'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='insurancepolicynumber',
            name='insurance',
        ),
        migrations.AddField(
            model_name='insurance',
            name='insurance_policy_numbers',
            field=models.ManyToManyField(blank=True, to='datalive_cust_veh.InsurancePolicyNumber'),
        ),
        migrations.AlterField(
            model_name='livery',
            name='views',
            field=models.ManyToManyField(related_name='livery_views', to='datalive_cust_veh.LiveryView'),
        ),
    ]