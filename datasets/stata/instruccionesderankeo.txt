

/***
El siguiente documento realiza la construcción de los rankings individuales y el ranking general que se utilizan en el mapa.

Está escrito en un formato .txt y .do y fue diseñado para correrse en STATA.

Para correr el do file son necesarios los siguientes datasets:
		"codigos postales.dta"
		"basureros.dta"
		"reporte_falta_agua.dta"
		"reportesretio.dta"
		"residual.dta"
		"sanitaria.dta"
		*/
		


cd "bases finales"
use "codigos postales.dta", clear
keep d_codigo
rename d_codigo codigo
destring codigo, replace
merge m:m codigo using basureros.dta
drop _merge
merge m:m codigo using reporte_falta_agua.dta
drop _merge
merge m:m codigo using reportesretio.dta
drop _merge
merge m:m codigo using residual.dta
drop _merge
merge m:m codigo using sanitaria.dta
drop _merge
drop rank_basureros rank_reporteagua rank_reporteretio rank_aguaresidual

replace basureros=0 if missing(basureros)
replace reporte_falta_agua=0 if missing(reporte_falta_agua)
replace reportesretio=0 if missing(reportesretio)
replace aguaresidual=0 if missing(aguaresidual)

**generación de los rankings para cada indicador***
xtile fbasureros= basureros, nq(5)
xtile freporte_falta_agua= reporte_falta_agua, nq(5)
xtile freportesretio = reportesretio , nq(5)
xtile faguaresidual = aguaresidual , nq(5)
xtile fadecuacinsanitaria = adecuacinsanitaria , nq(5)

**inversión de la variable de adecuación sanitaria, donde entre menor es el monto de drenaje y agua potable mayor es el riesgo"
gen f=1 if fadecuacinsanitaria==5
replace f=2 if fadecuacinsanitaria==4
replace f=3 if fadecuacinsanitaria==3
replace f=4 if fadecuacinsanitaria==2
replace f=5 if fadecuacinsanitaria==1

drop fadecuacinsanitaria

rename f fadecuacinsanitaria

/*** Construcción del ranking general


Para construir este modelo se tomaron en consideración los siguientes documentos académicos para determinar las ponderaciones:


	Fewtrell,Lorna and Colford,John M. "Water, Sanitation and Hygiene:Interventions and Diarrhoea A Systematic Review and Meta-analysis". Health, Nutrition and Population. The World Bank. 2004
	Ezzati, Majid et al. "Selected major risk factors and global and regional burden of disease" The Lancet , Volume 360 , Issue 9343 , 1347 - 1360	

Es importante destacar que se sobre-representó el valor de la adecuación sanitaria en la ponderación dado que es la variable con mejor representación de  la población
pues se extrajo de una base de datos que entrevista a nivel hogar a toda la población de la Ciudad de México. Los otros indicadores, mientras valiosos, están sujetos a un sesgos socioeconómicos 
que implica tener acceso a smartphones para hacer reportes en tiempo real que se registren o tener centros de atención cercanos y accesibles para realizar los reportes. Dichos valores se ajustaron
para representar el impacto en mejoras en infraestructura sobre la incidencia de diarrea que se reportan en los documentos académicos presentes anteriormente */

gen ranking=1 if ((fbasurero*(33/114)*.1 + freporte_falta_agua*(20/114)*.1  +  freportesretio*(25/114)*.1  + faguaresidual*(36/114)*.1 + fadecuacinsanitaria*.9)<=1) & ((fbasurero*(33/114)*.1 + freporte_falta_agua*(20/114)*.1  +  freportesretio*(25/114)*.1  + faguaresidual*(36/114)*.1 + fadecuacinsanitaria*.9)>=0)
replace ranking=2 if ((fbasurero*(33/114)*.1 + freporte_falta_agua*(20/114)*.1  +  freportesretio*(25/114)*.1  + faguaresidual*(36/114)*.1 + fadecuacinsanitaria*.9)<=2) & ((fbasurero*(33/114)*.1 + freporte_falta_agua*(20/114)*.1  +  freportesretio*(25/114)*.1  + faguaresidual*(36/114)*.1 + fadecuacinsanitaria*.9)>1)
replace ranking=3 if ((fbasurero*(33/114)*.1 + freporte_falta_agua*(20/114)*.1  +  freportesretio*(25/114)*.1  + faguaresidual*(36/114)*.1 + fadecuacinsanitaria*.9)<=3) & ((fbasurero*(33/114)*.1 + freporte_falta_agua*(20/114)*.1  +  freportesretio*(25/114)*.1  + faguaresidual*(36/114)*.1 + fadecuacinsanitaria*.9)>2)
replace ranking=4 if ((fbasurero*(33/114)*.1 + freporte_falta_agua*(20/114)*.1  +  freportesretio*(25/114)*.1  + faguaresidual*(36/114)*.1 + fadecuacinsanitaria*.9)<=4) & ((fbasurero*(33/114)*.1 + freporte_falta_agua*(20/114)*.1  +  freportesretio*(25/114)*.1  + faguaresidual*(36/114)*.1 + fadecuacinsanitaria*.9)>3)
replace ranking=5 if ((fbasurero*(33/114)*.1 + freporte_falta_agua*(20/114)*.1  +  freportesretio*(25/114)*.1  + faguaresidual*(36/114)*.1 + fadecuacinsanitaria*.9)<=5) & ((fbasurero*(33/114)*.1 + freporte_falta_agua*(20/114)*.1  +  freportesretio*(25/114)*.1  + faguaresidual*(36/114)*.1 + fadecuacinsanitaria*.9)>4)
replace ranking=0 if missing(ranking)
