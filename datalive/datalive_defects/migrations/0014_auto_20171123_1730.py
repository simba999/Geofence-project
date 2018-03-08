# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2017-11-23 17:30
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('datalive_cust_veh', '0008_auto_20171123_0844'),
        ('datalive_defects', '0013_auto_20171123_1639'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='defectfault',
            name='equipment',
        ),
        migrations.RemoveField(
            model_name='defectfault',
            name='fault',
        ),
        migrations.RemoveField(
            model_name='equipment',
            name='customer',
        ),
        migrations.RemoveField(
            model_name='equipment',
            name='depot',
        ),
        migrations.RemoveField(
            model_name='equipmentfault',
            name='equipment',
        ),
        migrations.RenameField(
            model_name='defect',
            old_name='defect_image',
            new_name='defect_photo',
        ),
        migrations.RenameField(
            model_name='equipmentdefinition',
            old_name='description',
            new_name='equipment_name',
        ),
        migrations.RemoveField(
            model_name='defect',
            name='equip_faults',
        ),
        migrations.AddField(
            model_name='equipmentdefinition',
            name='customer',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='datalive_cust_veh.Customer'),
        ),
        migrations.AlterField(
            model_name='defect',
            name='faults',
            field=models.ManyToManyField(to='datalive_defects.EquipmentResponses'),
        ),
        migrations.DeleteModel(
            name='DefectFault',
        ),
        migrations.DeleteModel(
            name='Equipment',
        ),
        migrations.DeleteModel(
            name='EquipmentFault',
        ),
    ]