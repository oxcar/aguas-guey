

/***
El siguiente documento realiza la construcci�n de los rankings individuales y el ranking general que se utilizan en el mapa.

Est� escrito en un formato .txt y .do y fue dise�ado para correrse en STATA.

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

**generaci�n de los rankings para cada indicador***
xtile fbasureros= basureros, nq(5)
xtile freporte_falta_agua= reporte_falta_agua, nq(5)
xtile freportesretio = reportesretio , nq(5)
xtile faguaresidual = aguaresidual , nq(5)
xtile fadecuacinsanitaria = adecuacinsanitaria , nq(5)

**inversi�n de la variable de adecuaci�n sanitaria, donde entre menor es el monto de drenaje y agua potable mayor es el riesgo"
gen f=1 if fadecuacinsanitaria==5
replace f=2 if fadecuacinsanitaria==4
replace f=3 if fadecuacinsanitaria==3
replace f=4 if fadecuacinsanitaria==2
replace f=5 if fadecuacinsanitaria==1

drop fadecuacinsanitaria

rename f fadecuacinsanitaria

/*** Construcci�n del ranking general


Para construir este modelo se tomaron en consideraci�n los siguientes documentos acad�micos para determinar las ponderaciones:


	Fewtrell,Lorna and Colford,John M. "Water, Sanitation and Hygiene:Interventions and Diarrhoea A Systematic Review and Meta-analysis". Health, Nutrition and Population. The World Bank. 2004
	Ezzati, Majid et al. "Selected major risk factors and global and regional burden of disease" The Lancet , Volume 360 , Issue 9343 , 1347 - 1360	

Es importante destacar que se sobre-represent� el valor de la adecuaci�n sanitaria en la ponderaci�n dado que es la variable con mejor representaci�n de  la poblaci�n
pues se extrajo de una base de datos que entrevista a nivel hogar a toda la poblaci�n de la Ciudad de M�xico. Los otros indicadores, mientras valiosos, est�n sujetos a un sesgos socioecon�micos 
que implica tener acceso a smartphones para hacer reportes en tiempo real que se registren o tener centros de atenci�n cercanos y accesibles para realizar los reportes. Dichos valores se ajustaron
para representar el impacto en mejoras en infraestructura sobre la incidencia de diarrea que se reportan en los documentos acad�micos presentes anteriormente */

gen ranking=1 if ((fbasurero*(33/114)*.1 + freporte_falta_agua*(20/114)*.1  +  freportesretio*(25/114)*.1  + faguaresidual*(36/114)*.1 + fadecuacinsanitaria*.9)<=1) & ((fbasurero*(33/114)*.1 + freporte_falta_agua*(20/114)*.1  +  freportesretio*(25/114)*.1  + faguaresidual*(36/114)*.1 + fadecuacinsanitaria*.9)>=0)
replace ranking=2 if ((fbasurero*(33/114)*.1 + freporte_falta_agua*(20/114)*.1  +  freportesretio*(25/114)*.1  + faguaresidual*(36/114)*.1 + fadecuacinsanitaria*.9)<=2) & ((fbasurero*(33/114)*.1 + freporte_falta_agua*(20/114)*.1  +  freportesretio*(25/114)*.1  + faguaresidual*(36/114)*.1 + fadecuacinsanitaria*.9)>1)
replace ranking=3 if ((fbasurero*(33/114)*.1 + freporte_falta_agua*(20/114)*.1  +  freportesretio*(25/114)*.1  + faguaresidual*(36/114)*.1 + fadecuacinsanitaria*.9)<=3) & ((fbasurero*(33/114)*.1 + freporte_falta_agua*(20/114)*.1  +  freportesretio*(25/114)*.1  + faguaresidual*(36/114)*.1 + fadecuacinsanitaria*.9)>2)
replace ranking=4 if ((fbasurero*(33/114)*.1 + freporte_falta_agua*(20/114)*.1  +  freportesretio*(25/114)*.1  + faguaresidual*(36/114)*.1 + fadecuacinsanitaria*.9)<=4) & ((fbasurero*(33/114)*.1 + freporte_falta_agua*(20/114)*.1  +  freportesretio*(25/114)*.1  + faguaresidual*(36/114)*.1 + fadecuacinsanitaria*.9)>3)
replace ranking=5 if ((fbasurero*(33/114)*.1 + freporte_falta_agua*(20/114)*.1  +  freportesretio*(25/114)*.1  + faguaresidual*(36/114)*.1 + fadecuacinsanitaria*.9)<=5) & ((fbasurero*(33/114)*.1 + freporte_falta_agua*(20/114)*.1  +  freportesretio*(25/114)*.1  + faguaresidual*(36/114)*.1 + fadecuacinsanitaria*.9)>4)
replace ranking=0 if missing(ranking)
