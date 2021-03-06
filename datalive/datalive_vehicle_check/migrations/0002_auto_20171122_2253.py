# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2017-11-22 22:53
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('datalive_cust_veh', '0007_auto_20171113_1810'),
        ('datalive_vehicle_check', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='QuestionDefinition',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('index', models.IntegerField()),
                ('description', models.CharField(max_length=128)),
            ],
        ),
        migrations.CreateModel(
            name='QuestionDefinitionAnswers',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('answer', models.CharField(max_length=128)),
            ],
        ),
        migrations.CreateModel(
            name='QuestionResponses',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('answer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='datalive_vehicle_check.QuestionDefinitionAnswers')),
                ('question', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='datalive_vehicle_check.QuestionDefinition')),
            ],
        ),
        migrations.RemoveField(
            model_name='reportdetail',
            name='depot',
        ),
        migrations.RemoveField(
            model_name='reportdetail',
            name='fixed_damage',
        ),
        migrations.RemoveField(
            model_name='reportdetail',
            name='new_damage',
        ),
        migrations.RemoveField(
            model_name='reportdetail',
            name='photos',
        ),
        migrations.RenameField(
            model_name='report',
            old_name='creation_date',
            new_name='date',
        ),
        migrations.RenameField(
            model_name='report',
            old_name='creation_time',
            new_name='time',
        ),
        migrations.RemoveField(
            model_name='report',
            name='report_detail',
        ),
        migrations.AddField(
            model_name='report',
            name='checker_name',
            field=models.CharField(max_length=200, null=True),
        ),
        migrations.AddField(
            model_name='report',
            name='checker_signature',
            field=models.ImageField(null=True, upload_to='vehicle-reports/%Y/%m/%d/signature/'),
        ),
        migrations.AddField(
            model_name='report',
            name='defect_details',
            field=models.TextField(blank=True, max_length=700, null=True),
        ),
        migrations.AddField(
            model_name='report',
            name='depot',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='datalive_cust_veh.VehicleGroup'),
        ),
        migrations.AddField(
            model_name='report',
            name='driver_name',
            field=models.CharField(max_length=200, null=True),
        ),
        migrations.AddField(
            model_name='report',
            name='driver_signature',
            field=models.ImageField(null=True, upload_to='vehicle-reports/%Y/%m/%d/signature/'),
        ),
        migrations.AddField(
            model_name='report',
            name='fixed_damage',
            field=models.ManyToManyField(blank=True, related_name='fixed_damages', to='datalive_vehicle_check.Damage'),
        ),
        migrations.AddField(
            model_name='report',
            name='new_damage',
            field=models.ManyToManyField(blank=True, related_name='new_damages', to='datalive_vehicle_check.Damage'),
        ),
        migrations.AddField(
            model_name='report',
            name='notes',
            field=models.TextField(blank=True, max_length=700, null=True),
        ),
        migrations.AddField(
            model_name='report',
            name='odometer',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='report',
            name='photos',
            field=models.ManyToManyField(blank=True, to='datalive_vehicle_check.ReportPhoto'),
        ),
        migrations.AddField(
            model_name='report',
            name='send_email_flag',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='report',
            name='type',
            field=models.CharField(choices=[('STD', 'Standard Vehicle Check Complete'), ('AUD', 'Auditor Vehicle Check of Vehicle'), ('HND', 'ODF handover check')], default='STD', max_length=5),
        ),
        migrations.DeleteModel(
            name='ReportDetail',
        ),
        migrations.AddField(
            model_name='questiondefinition',
            name='answers',
            field=models.ManyToManyField(to='datalive_vehicle_check.QuestionDefinitionAnswers'),
        ),
        migrations.AddField(
            model_name='report',
            name='question_responses',
            field=models.ManyToManyField(to='datalive_vehicle_check.QuestionResponses'),
        ),
    ]
