# -*- coding: utf-8 -*-
# Generated by Django 1.9.5 on 2017-11-24 15:58
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('datalive_vehicle_help', '0002_auto_20171124_1505'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='faq',
            name='customer',
        ),
        migrations.RemoveField(
            model_name='faqactions',
            name='faqDescription',
        ),
        migrations.RemoveField(
            model_name='faqdescription',
            name='faq',
        ),
        migrations.DeleteModel(
            name='FAQ',
        ),
        migrations.DeleteModel(
            name='FAQActions',
        ),
        migrations.DeleteModel(
            name='FAQDescription',
        ),
    ]
