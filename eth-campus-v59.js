(() => {
  "use strict";

  if (window.__SIMON_ETH_CAMPUS_V59__) return;
  window.__SIMON_ETH_CAMPUS_V59__ = true;
  window.__SIMON_ETH_CAMPUS_V58__ = true;
  window.__SIMON_ETH_CAMPUS_V57__ = true;
  window.__SIMON_ETH_CAMPUS_V56__ = true;
  window.__SIMON_ETH_CAMPUS_V55__ = true;

  const VERSION = 59;
  const GAME_WIDTH = 820;
  const GAME_HEIGHT = 390;
  const GROUND_TOP = 338;

  const TRANSIT_KEY = "PolybahnTransitScene";
  const TERRACE_KEY = "PolyterrasseScene";
  const ETH_KEY = "ETHInteriorScene";

  const TERRACE_WIDTH = 1720;
  const ETH_WIDTH = 1180;

  // Polybahn sits clearly LEFT of the Bahnhofstrasse tram.
  // Final tram visual begins around x=470; the Polybahn facade ends at x≈425.
  const POLYBAHN_BAHNHOF_X = 880;

  const QUESTIONS = [{"id":"m01","category":"MECHANIK","question":"Eine generalisierte Koordinate q ist zyklisch, also kommt im Lagrangian nicht explizit vor. Was folgt unmittelbar?","answers":["Der zu q konjugierte Impuls ist erhalten.","Die zu q gehörige Geschwindigkeit ist null.","Die Gesamtenergie muss null sein.","q selbst ist konstant."],"correct":0,"explanation":"Aus d/dt(∂L/∂qdot)=∂L/∂q und ∂L/∂q=0 folgt die Erhaltung des kanonischen Impulses."},{"id":"m02","category":"MECHANIK","question":"Welche Poisson-Klammer gilt für die Komponenten des Drehimpulses?","answers":["{Lx,Ly}=0","{Lx,Ly}=Lz","{Lx,Ly}=-Lz","{Lx,Ly}=Lx+Ly"],"correct":1,"explanation":"Die Drehimpulskomponenten erfüllen {Li,Lj}=epsilon_ijk Lk."},{"id":"m03","category":"MECHANIK","question":"Für ein gebundenes System mit homogenem Potential V(r) proportional r^n lautet der Virialsatz:","answers":["<T>=n<V>","2<T>=n<V>","<T>=2n<V>","2<T>=-n<V> für jedes n"],"correct":1,"explanation":"Für ein homogenes Potential vom Grad n gilt 2<T>=n<V>."},{"id":"m04","category":"MECHANIK","question":"Welche Größe bleibt nach dem Liouville-Theorem unter Hamiltonscher Zeitentwicklung erhalten?","answers":["Die Geschwindigkeit jedes Teilchens","Das Phasenraumvolumen","Nur die Ortsraumdichte","Die kinetische Energie"],"correct":1,"explanation":"Hamiltonsche Flüsse sind im Phasenraum inkompressibel."},{"id":"m05","category":"MECHANIK","question":"Was ist im Zentralkraftproblem das effektive Potential für festen Drehimpuls L?","answers":["V(r)+L²/(2mr²)","V(r)-L²/(2mr²)","V(r)+L/(mr)","V(r)+mr²L²/2"],"correct":0,"explanation":"Der Zentrifugalterm L²/(2mr²) addiert sich zum radialen Potential."},{"id":"m06","category":"MECHANIK","question":"Rotation eines frei fliegenden starren Körpers um welche Hauptachse ist im Allgemeinen instabil?","answers":["Achse mit kleinstem Trägheitsmoment","Achse mit mittlerem Trägheitsmoment","Achse mit größtem Trägheitsmoment","Alle drei sind gleich instabil"],"correct":1,"explanation":"Das Intermediate-Axis-Theorem macht die Rotation um die mittlere Hauptträgheitsachse instabil."},{"id":"m07","category":"MECHANIK","question":"Welche kontinuierliche Symmetrie führt über Noethers Theorem zur Energieerhaltung?","answers":["Raumtranslation","Zeittranslation","Rotation","Galilei-Boost"],"correct":1,"explanation":"Zeittranslationsinvarianz liefert die Erhaltung der Energie."},{"id":"m08","category":"MECHANIK","question":"Für gebundene Keplerbahnen gilt zwischen Umlaufzeit T und großer Halbachse a:","answers":["T proportional a","T² proportional a³","T³ proportional a²","T proportional a³"],"correct":1,"explanation":"Keplers drittes Gesetz lautet T² proportional a³."},{"id":"m09","category":"MECHANIK","question":"Welche Hamilton-Gleichung ist korrekt?","answers":["qdot=-∂H/∂p","qdot=∂H/∂p","pdot=∂H/∂q","pdot=∂L/∂p"],"correct":1,"explanation":"Hamiltons Gleichungen lauten qdot=∂H/∂p und pdot=-∂H/∂q."},{"id":"m10","category":"MECHANIK","question":"Die reduzierte Masse eines Zweikörpersystems mit m1 und m2 ist:","answers":["m1+m2","m1m2","m1m2/(m1+m2)","(m1+m2)/(m1m2)"],"correct":2,"explanation":"Mit der Relativkoordinate reduziert sich das Problem auf mu=m1m2/(m1+m2)."},{"id":"m11","category":"MECHANIK","question":"Für den harmonischen Oszillator ist die Wirkungsvariable J=(1/2pi)∮p dq gleich:","answers":["E/omega","E omega","2pi E/omega","omega/E"],"correct":0,"explanation":"Mit dieser Konvention gilt J=E/omega."},{"id":"m12","category":"MECHANIK","question":"Ein drehmomentfreier starrer Körper bewegt sich frei. Welche Größe ist im Inertialsystem sicher konstant?","answers":["Seine Winkelgeschwindigkeit als Vektor","Sein Drehimpuls als Vektor","Jede Euler-Winkelgeschwindigkeit","Seine Rotationsachse im Körper"],"correct":1,"explanation":"Ohne äußeres Drehmoment ist der Gesamtdrehimpuls im Inertialsystem konstant."},{"id":"m13","category":"MECHANIK","question":"Wie lautet das Trägheitsmoment eines dünnen Rings der Masse M und des Radius R um seine Symmetrieachse?","answers":["MR²","(1/2)MR²","(2/5)MR²","(1/12)MR²"],"correct":0,"explanation":"Die gesamte Masse liegt im Abstand R von der Achse: I=MR²."},{"id":"m14","category":"MECHANIK","question":"Welche Fluchtgeschwindigkeit gilt von der Oberfläche eines kugelsymmetrischen Körpers der Masse M und des Radius R?","answers":["sqrt(GM/R)","sqrt(2GM/R)","2GM/R","sqrt(GM/2R)"],"correct":1,"explanation":"Aus E=0 für die Grenzbahn folgt v_esc=sqrt(2GM/R)."},{"id":"m15","category":"MECHANIK","question":"Eine kanonische Transformation zeichnet sich insbesondere dadurch aus, dass sie...","answers":["die Hamilton-Funktion unverändert lässt.","die symplektische Struktur erhält.","jede Energie in kinetische Energie umwandelt.","nur linear sein darf."],"correct":1,"explanation":"Kanonische Transformationen erhalten die symplektische Form bzw. die Hamilton-Struktur."},{"id":"e01","category":"ELEKTRODYNAMIK","question":"Welche Maxwell-Gleichung drückt die Abwesenheit magnetischer Monopole in klassischer Elektrodynamik aus?","answers":["div E=0","div B=0","curl B=0","curl E=0"],"correct":1,"explanation":"Die magnetische Flussdichte ist quellenfrei: ∇·B=0."},{"id":"e02","category":"ELEKTRODYNAMIK","question":"Welche Differentialform hat das Faradaysche Induktionsgesetz?","answers":["curl E=-∂B/∂t","curl B=-∂E/∂t","div E=-∂B/∂t","curl E=∂B/∂t"],"correct":0,"explanation":"Eine zeitliche Änderung von B erzeugt ein Wirbelfeld E mit negativem Vorzeichen."},{"id":"e03","category":"ELEKTRODYNAMIK","question":"Welcher Zusatz macht das Ampèresche Gesetz konsistent mit der Ladungserhaltung?","answers":["Der magnetische Monopolterm","Der Verschiebungsstrom epsilon0 ∂E/∂t","Ein zusätzlicher Coulomb-Term","Die Lorentzkraft"],"correct":1,"explanation":"Maxwell ergänzte den Verschiebungsstrom, damit die Kontinuitätsgleichung erfüllt bleibt."},{"id":"e04","category":"ELEKTRODYNAMIK","question":"Für eine ebene elektromagnetische Welle im Vakuum gilt für die Beträge:","answers":["E/B=c","E/B=1/c","E=B","EB=c"],"correct":0,"explanation":"Im Vakuum ist E=cB."},{"id":"e05","category":"ELEKTRODYNAMIK","question":"Welche Richtung hat der Poynting-Vektor S?","answers":["Parallel zu E","Parallel zu B","Parallel zu E×H","Parallel zu H×E"],"correct":2,"explanation":"S=E×H zeigt in Richtung des elektromagnetischen Energieflusses."},{"id":"e06","category":"ELEKTRODYNAMIK","question":"Welche Eichtransformation lässt E und B unverändert?","answers":["A→A+grad chi und phi→phi-∂chi/∂t","A→A-grad chi und phi unverändert","A→2A und phi→2phi","A→A+chi und phi→phi+chi"],"correct":0,"explanation":"Diese gekoppelte Transformation der Potentiale lässt die physikalischen Felder invariant."},{"id":"e07","category":"ELEKTRODYNAMIK","question":"Wie lautet die Energiedichte des elektromagnetischen Feldes im Vakuum?","answers":["epsilon0 E² + B²/mu0","(1/2)epsilon0 E² + B²/(2mu0)","epsilon0 EB","E²/(2mu0)+epsilon0 B²/2"],"correct":1,"explanation":"Elektrischer und magnetischer Anteil tragen jeweils mit einem Faktor 1/2 bei."},{"id":"e08","category":"ELEKTRODYNAMIK","question":"Ein rechteckiger Hohlleiter habe breite Seite a. Die Grenzfrequenz der TE10-Mode im Vakuum ist:","answers":["c/a","c/(2a)","2c/a","c/(4a)"],"correct":1,"explanation":"Für TE10 gilt f_c=c/(2a)."},{"id":"e09","category":"ELEKTRODYNAMIK","question":"Wie skaliert die Skintiefe delta eines guten Leiters mit Kreisfrequenz omega?","answers":["delta proportional sqrt(omega)","delta proportional 1/omega","delta proportional 1/sqrt(omega)","delta ist frequenzunabhängig"],"correct":2,"explanation":"Für gute Leiter gilt delta≈sqrt(2/(mu sigma omega))."},{"id":"e10","category":"ELEKTRODYNAMIK","question":"Die Winkelverteilung der Leistung eines oszillierenden elektrischen Dipols ist proportional zu...","answers":["cos²(theta)","sin²(theta)","sin(theta)","1/r² ohne Winkelabhängigkeit"],"correct":1,"explanation":"Dipolstrahlung verschwindet auf der Dipolachse und ist transversal maximal."},{"id":"e11","category":"ELEKTRODYNAMIK","question":"Welche Lorentzkraft wirkt auf eine Ladung q mit Geschwindigkeit v?","answers":["q(E-v×B)","q(E+v×B)","q(v×E+B)","q(E+B)"],"correct":1,"explanation":"Die klassische Lorentzkraft lautet F=q(E+v×B)."},{"id":"e12","category":"ELEKTRODYNAMIK","question":"Im elektrostatischen Gleichgewicht gilt im Inneren eines idealen Leiters:","answers":["E ist konstant und ungleich null.","E=0.","B=0 muss ebenfalls gelten.","Das Potential muss null sein."],"correct":1,"explanation":"Freie Ladungen ordnen sich so um, dass das elektrische Feld im Leiterinneren verschwindet."},{"id":"e13","category":"ELEKTRODYNAMIK","question":"Welche beiden Lorentz-Invarianten des elektromagnetischen Feldes sind bis auf Konstanten besonders charakteristisch?","answers":["E+B und E-B","E·B und E²-c²B²","E×B und E/B","div E und div B"],"correct":1,"explanation":"E·B sowie E²-c²B² bleiben unter Lorentztransformationen invariant."},{"id":"e14","category":"ELEKTRODYNAMIK","question":"Für einen idealen Parallelplattenkondensator mit Fläche A, Abstand d und Permittivität epsilon gilt:","answers":["C=epsilon d/A","C=epsilon A/d","C=A/(epsilon d)","C=epsilon/(Ad)"],"correct":1,"explanation":"Die Kapazität ist proportional zur Fläche und umgekehrt proportional zum Plattenabstand."},{"id":"e15","category":"ELEKTRODYNAMIK","question":"Die abgestrahlte Leistung einer nichtrelativistisch beschleunigten Punktladung skaliert nach Larmor mit...","answers":["a","a²","1/a","a³"],"correct":1,"explanation":"Die Larmor-Leistung ist proportional zum Quadrat der Beschleunigung."},{"id":"q01","category":"QUANTENMECHANIK","question":"Welche kanonische Vertauschungsrelation gilt in einer Dimension?","answers":["[x,p]=0","[x,p]=i hbar","[x,p]=-hbar","[x,p]=i"],"correct":1,"explanation":"Ort und Impuls erfüllen [x,p]=iħ."},{"id":"q02","category":"QUANTENMECHANIK","question":"Welche minimale Heisenberg-Unschärferelation gilt für x und p?","answers":["Delta x Delta p >= hbar/2","Delta x Delta p >= hbar","Delta x Delta p = 0","Delta x Delta p <= hbar/2"],"correct":0,"explanation":"Aus der kanonischen Kommutatorrelation folgt Delta x Delta p >= ħ/2."},{"id":"q03","category":"QUANTENMECHANIK","question":"Die Grundzustandsenergie des eindimensionalen harmonischen Oszillators ist:","answers":["0","hbar omega","(1/2)hbar omega","(3/2)hbar omega"],"correct":2,"explanation":"Die Nullpunktsenergie beträgt ħω/2."},{"id":"q04","category":"QUANTENMECHANIK","question":"Für ein Teilchen im eindimensionalen unendlichen Kasten der Länge L gilt:","answers":["E_n proportional n","E_n proportional n²","E_n proportional 1/n","E_n ist unabhängig von n"],"correct":1,"explanation":"E_n=n² pi² hbar²/(2mL²)."},{"id":"q05","category":"QUANTENMECHANIK","question":"Die Energieverschiebung erster Ordnung in nichtentarteter zeitunabhängiger Störungstheorie ist:","answers":["<n|V|n>","<n|H0|n>²","Summe_m <m|V|n>","0 für jede Störung"],"correct":0,"explanation":"In erster Ordnung ist die Verschiebung der Erwartungswert der Störung im ungestörten Zustand."},{"id":"q06","category":"QUANTENMECHANIK","question":"Wie skaliert die gebundene Energie des Wasserstoffatoms im nichtrelativistischen Coulomb-Modell?","answers":["E_n proportional -1/n","E_n proportional -1/n²","E_n proportional -n²","E_n proportional 1/n²"],"correct":1,"explanation":"Die Energien sind E_n≈-13.6 eV/n²."},{"id":"q07","category":"QUANTENMECHANIK","question":"Der Eigenwert von L² für Quantenzahl l lautet:","answers":["hbar² l²","hbar² l(l+1)","hbar²(l+1)²","hbar l"],"correct":1,"explanation":"Drehimpulseigenzustände haben L²=ħ²l(l+1)."},{"id":"q08","category":"QUANTENMECHANIK","question":"Welche Reinheit Tr(rho²) besitzt ein normierter reiner Zustand?","answers":["0","1/2","1","Sie ist immer größer als 1."],"correct":2,"explanation":"Für einen Projektor rho=|psi><psi| gilt rho²=rho und damit Tr(rho²)=1."},{"id":"q09","category":"QUANTENMECHANIK","question":"Warum bleibt die Norm eines abgeschlossenen Quantenzustands bei Schrödinger-Zeitentwicklung erhalten?","answers":["Weil die Zeitentwicklung unitär ist.","Weil jede Wellenfunktion reell ist.","Weil H immer null ist.","Weil Ort und Impuls kommutieren."],"correct":0,"explanation":"Ein hermitescher Hamiltonoperator erzeugt einen unitären Zeitentwicklungsoperator."},{"id":"q10","category":"QUANTENMECHANIK","question":"Für ein Spin-1/2-Teilchen ist der Eigenwert von S²:","answers":["hbar²/4","hbar²/2","3hbar²/4","hbar²"],"correct":2,"explanation":"S²=s(s+1)ħ² mit s=1/2 ergibt 3ħ²/4."},{"id":"q11","category":"QUANTENMECHANIK","question":"Der Singulettzustand zweier Spin-1/2-Teilchen besitzt Gesamtdrehimpuls...","answers":["0","hbar/2","hbar","sqrt(2)hbar"],"correct":0,"explanation":"Im Singulett koppeln die beiden Spins zu Gesamtspin S=0."},{"id":"q12","category":"QUANTENMECHANIK","question":"Für eine breite rechteckige Tunnelbarriere skaliert die Transmission im WKB-Limes hauptsächlich wie...","answers":["exp(+2 kappa a)","exp(-2 kappa a)","1/(kappa a)","sin²(kappa a)"],"correct":1,"explanation":"Unter der Barriere fällt die Wellenfunktion exponentiell; T≈exp(-2κa)."},{"id":"q13","category":"QUANTENMECHANIK","question":"Die WKB-Quantisierung zwischen zwei klassischen Umkehrpunkten lautet näherungsweise:","answers":["Integral p dx=(n+1/2) pi hbar","Integral p dx=n hbar","Integral p dx=2n pi","Integral p dx=(n-1/2)hbar"],"correct":0,"explanation":"Der Maslov-Beitrag der zwei Umkehrpunkte liefert den Faktor n+1/2."},{"id":"q14","category":"QUANTENMECHANIK","question":"Welche Parität besitzt der n-te Eigenzustand des eindimensionalen harmonischen Oszillators?","answers":["Immer gerade","Immer ungerade","(-1)^n","Keine definierte Parität"],"correct":2,"explanation":"Gerade n liefern gerade, ungerade n ungerade Zustände."},{"id":"q15","category":"QUANTENMECHANIK","question":"Wie wirkt der Impulsoperator in Ortsdarstellung?","answers":["p=-i hbar d/dx","p=i hbar x","p=-hbar² d²/dx²","p=x"],"correct":0,"explanation":"In Ortsdarstellung ist p=-iħ∂/∂x."},{"id":"q16","category":"QUANTENMECHANIK","question":"Welche Aussage ist eine Form des Ehrenfest-Theorems für H=p²/(2m)+V(x)?","answers":["d<x>/dt=<p>/m","d<x>/dt=<x>/m","d<p>/dt=<V>","d<p>/dt=0 immer"],"correct":0,"explanation":"Die Erwartungswerte folgen formal den Hamilton-Gleichungen: d<x>/dt=<p>/m."},{"id":"q17","category":"QUANTENMECHANIK","question":"Die Gesamtwellenfunktion identischer Fermionen ist unter Vertauschung zweier Teilchen...","answers":["symmetrisch.","antisymmetrisch.","unverändert bis auf einen beliebigen Betrag.","nur bei Spin 0 antisymmetrisch."],"correct":1,"explanation":"Das Spin-Statistik-Theorem verlangt für Fermionen antisymmetrische Vielteilchenzustände."},{"id":"q18","category":"QUANTENMECHANIK","question":"Welche Relation gilt für bosonische Erzeugungs- und Vernichtungsoperatoren einer Mode?","answers":["{a,a†}=1","[a,a†]=1","[a,a†]=0","a a†=0"],"correct":1,"explanation":"Bosonische Moden erfüllen die kanonische Kommutatorrelation [a,a†]=1."},{"id":"q19","category":"QUANTENMECHANIK","question":"Welche Relation gilt für fermionische Operatoren derselben Mode?","answers":["[c,c†]=1","{c,c†}=1","{c,c†}=0","c c†=-1"],"correct":1,"explanation":"Fermionische Moden erfüllen die Antikommutatorrelation {c,c†}=1."},{"id":"q20","category":"QUANTENMECHANIK","question":"Für einen elektrischen Dipolübergang in einem wasserstoffähnlichen Atom gilt typischerweise welche Auswahlregel für l?","answers":["Delta l=0","Delta l=±1","Delta l=±2","Delta l beliebig"],"correct":1,"explanation":"Der elektrische Dipoloperator hat ungerade Parität und koppelt Zustände mit Δl=±1."},{"id":"t01","category":"THERMODYNAMIK","question":"Für einen reversiblen Prozess gilt für die Entropieänderung:","answers":["dS=dQ_rev/T","dS=T dQ_rev","dS=dQ_rev","dS=0 immer"],"correct":0,"explanation":"Die thermodynamische Definition für reversible Wärmeübertragung ist dS=dQ_rev/T."},{"id":"t02","category":"STATISTISCHE PHYSIK","question":"Die kanonische Zustandssumme lautet:","answers":["Z=Summe exp(-beta E_i)","Z=Summe beta E_i","Z=exp(+beta F)","Z=Summe E_i"],"correct":0,"explanation":"Im kanonischen Ensemble gewichtet der Boltzmannfaktor jeden Zustand mit exp(-βE_i)."},{"id":"t03","category":"STATISTISCHE PHYSIK","question":"Wie hängt die Helmholtz-Freie Energie F von der kanonischen Zustandssumme Z ab?","answers":["F=kT ln Z","F=-kT ln Z","F=-Z/(kT)","F=T/Z"],"correct":1,"explanation":"F=-k_B T ln Z."},{"id":"t04","category":"STATISTISCHE PHYSIK","question":"Welchen mittleren Energiebeitrag liefert ein klassischer quadratischer Freiheitsgrad nach dem Äquipartitionstheorem?","answers":["kT","kT/2","2kT","0"],"correct":1,"explanation":"Jeder quadratische Term trägt im klassischen Grenzfall k_B T/2 bei."},{"id":"t05","category":"THERMODYNAMIK","question":"Der maximale Wirkungsgrad einer Carnot-Maschine zwischen Th und Tc ist:","answers":["Tc/Th","1-Tc/Th","1-Th/Tc","Th-Tc"],"correct":1,"explanation":"Der Carnot-Wirkungsgrad ist eta=1-Tc/Th."},{"id":"t06","category":"STATISTISCHE PHYSIK","question":"Im kanonischen Ensemble gilt für die Energievarianz:","answers":["Var(E)=k_B T² C_V","Var(E)=C_V/(k_B T²)","Var(E)=k_B T/C_V","Var(E)=0"],"correct":0,"explanation":"Die kanonischen Energiefluktuationen erfüllen <(ΔE)²>=k_B T² C_V."},{"id":"t07","category":"THERMODYNAMIK","question":"Für ein ideales Gas gilt molar:","answers":["C_P+C_V=R","C_P-C_V=R","C_V-C_P=R","C_P/C_V=R"],"correct":1,"explanation":"Die Mayer-Beziehung lautet C_P-C_V=R."},{"id":"t08","category":"STATISTISCHE PHYSIK","question":"Die wahrscheinlichste Geschwindigkeit der Maxwell-Verteilung eines Teilchens der Masse m ist:","answers":["sqrt(kT/m)","sqrt(2kT/m)","sqrt(3kT/m)","2kT/m"],"correct":1,"explanation":"Das Maximum der Geschwindigkeitsverteilung liegt bei v_mp=sqrt(2k_B T/m)."},{"id":"t09","category":"STATISTISCHE PHYSIK","question":"Welches chemische Potential besitzen Photonen im thermischen Gleichgewicht, wenn ihre Zahl nicht erhalten ist?","answers":["mu=mc²","mu=0","mu=kT","mu<0 zwingend und endlich"],"correct":1,"explanation":"Da die Photonenzahl nicht erhalten ist, ist ihr Gleichgewichts-chemisches Potential null."},{"id":"t10","category":"STATISTISCHE PHYSIK","question":"Wie groß ist die Fermi-Dirac-Besetzung f(E) genau bei E=mu für endliche Temperatur?","answers":["0","1/4","1/2","1"],"correct":2,"explanation":"f(E)=1/(exp((E-mu)/kT)+1), also f(mu)=1/2."},{"id":"t11","category":"STATISTISCHE PHYSIK","question":"Die mikrokanonische Boltzmann-Entropie lautet:","answers":["S=k_B ln Omega","S=Omega/k_B","S=k_B Omega²","S=-k_B/Omega"],"correct":0,"explanation":"Die Zahl zugänglicher Mikrozustände Omega geht logarithmisch in die Entropie ein."},{"id":"t12","category":"THERMODYNAMIK","question":"Die Clapeyron-Gleichung für eine Phasengrenze lautet:","answers":["dP/dT=L/(T Delta v)","dP/dT=T Delta v/L","dP/dT=L Delta v/T","dP/dT=Delta v/(LT)"],"correct":0,"explanation":"Die Steigung der Koexistenzlinie ist L/(T Δv)."},{"id":"t13","category":"THERMODYNAMIK","question":"Für eine reversible adiabatische Zustandsänderung eines idealen Gases gilt:","answers":["PV=konstant","PV^gamma=konstant","P/T=konstant","V/T=konstant"],"correct":1,"explanation":"Für ein ideales Gas in einer reversiblen Adiabate gilt PV^γ=const."},{"id":"t14","category":"STATISTISCHE PHYSIK","question":"Welches Ensemble beschreibt ein System mit festem T, V und chemischem Potential mu, aber variabler Teilchenzahl?","answers":["Mikrokanonisch","Kanonisch","Großkanonisch","Isenthalp"],"correct":2,"explanation":"Das großkanonische Ensemble erlaubt Teilchenaustausch und hält T,V,mu fest."},{"id":"t15","category":"STATISTISCHE PHYSIK","question":"Welche Besonderheit kann die Wärmekapazität eines isolierten selbstgravitierenden Systems besitzen?","answers":["Sie muss exakt null sein.","Sie kann negativ sein.","Sie ist immer positiv.","Sie ist immer unendlich."],"correct":1,"explanation":"Selbstgravitierende Systeme können mikrokanonisch eine negative Wärmekapazität zeigen."},{"id":"r01","category":"RELATIVITÄT","question":"Der Lorentzfaktor gamma ist:","answers":["sqrt(1-v²/c²)","1/sqrt(1-v²/c²)","1/(1-v/c)","sqrt(1+v²/c²)"],"correct":1,"explanation":"gamma=(1-beta²)^(-1/2)."},{"id":"r02","category":"RELATIVITÄT","question":"Welche Größe ist zwischen Inertialsystemen Lorentz-invariant?","answers":["Der räumliche Abstand allein","Die Zeitdifferenz allein","Das Raumzeitintervall","Die Geschwindigkeit eines massiven Körpers"],"correct":2,"explanation":"Lorentztransformationen erhalten das Minkowski-Intervall."},{"id":"r03","category":"RELATIVITÄT","question":"Welche Energie-Impuls-Beziehung gilt für ein freies Teilchen?","answers":["E²=p²c²+m²c⁴","E=pc+m c² immer","E²=p²c⁴+m²c²","E=mv²/2 exakt"],"correct":0,"explanation":"Die relativistische Massenschalenbedingung ist E²=p²c²+m²c⁴."},{"id":"r04","category":"RELATIVITÄT","question":"Für ein masseloses Teilchen gilt im Vakuum:","answers":["E=mc²","E=pc","E=p/c","p=0"],"correct":1,"explanation":"Setzt man m=0 in die Energie-Impuls-Beziehung, folgt E=pc."},{"id":"r05","category":"RELATIVITÄT","question":"Der Schwarzschildradius einer nichtrotierenden Masse M ist:","answers":["GM/c²","2GM/c²","GM/(2c²)","2GM/c"],"correct":1,"explanation":"r_s=2GM/c²."},{"id":"r06","category":"RELATIVITÄT","question":"Zwischen zwei zeitartig getrennten Ereignissen ist die Eigenzeit entlang welcher flachen Raumzeitbahn maximal?","answers":["Beliebiger beschleunigter Bahn","Inertialer gerader Weltlinie","Lichtartiger Bahn","Kreisbahn mit maximaler Geschwindigkeit"],"correct":1,"explanation":"In flacher Raumzeit maximiert die inertiale Weltlinie die Eigenzeit zwischen den Ereignissen."},{"id":"r07","category":"RELATIVITÄT","question":"Ein bewegter Stab hat in Bewegungsrichtung gemessene Länge L. In seinem Ruhesystem sei L0. Es gilt:","answers":["L=gamma L0","L=L0/gamma","L=L0","L=gamma² L0"],"correct":1,"explanation":"Längenkontraktion verkürzt die gemessene Länge um den Faktor gamma."},{"id":"r08","category":"RELATIVITÄT","question":"Für eine bewegte Uhr gilt zwischen Koordinatenzeit Delta t und Eigenzeit Delta tau:","answers":["Delta t=Delta tau/gamma","Delta t=gamma Delta tau","Delta t=Delta tau","Delta tau=gamma² Delta t"],"correct":1,"explanation":"Zeitdilatation: Eine bewegte Uhr akkumuliert weniger Eigenzeit, Δt=γΔτ."},{"id":"r09","category":"RELATIVITÄT","question":"Welche Aussage beschreibt die Relativität der Gleichzeitigkeit?","answers":["Alle Inertialsysteme stimmen über Gleichzeitigkeit überein.","Raumartig getrennte Ereignisse können je nach Inertialsystem unterschiedliche Zeitreihenfolgen besitzen.","Zeitartige Ereignisse können ihre Reihenfolge vertauschen.","Nur beschleunigte Beobachter sehen Gleichzeitigkeit anders."],"correct":1,"explanation":"Bei raumartiger Trennung ist die zeitliche Reihenfolge nicht invariant."},{"id":"r10","category":"RELATIVITÄT","question":"Warum sind Rapiditäten in einer Dimension praktisch?","answers":["Sie multiplizieren sich bei Boosts.","Sie addieren sich bei aufeinanderfolgenden kollinearen Lorentz-Boosts.","Sie sind immer gleich der Geschwindigkeit.","Sie eliminieren den Lorentzfaktor."],"correct":1,"explanation":"Kollineare Boosts entsprechen einer Addition der Rapiditäten."},{"id":"r11","category":"RELATIVITÄT","question":"Der relativistische longitudinale Dopplerfaktor für eine sich entfernende Quelle ist:","answers":["sqrt((1+beta)/(1-beta))","sqrt((1-beta)/(1+beta))","1-beta²","gamma"],"correct":1,"explanation":"Für Rezession wird die Frequenz um sqrt((1-beta)/(1+beta)) rotverschoben."},{"id":"r12","category":"RELATIVITÄT","question":"Im Zwillingsparadoxon akkumuliert bei Rückkehr typischerweise weniger Eigenzeit...","answers":["der auf der Erde inertial verbleibende Zwilling.","der reisende Zwilling.","beide exakt gleich.","immer der schwerere Zwilling."],"correct":1,"explanation":"Die Weltlinie des Reisenden hat zwischen Abflug und Wiedersehen geringere Eigenzeit."},{"id":"r13","category":"RELATIVITÄT","question":"Was besagt das Äquivalenzprinzip lokal?","answers":["Gravitation ist global immer eliminierbar.","Ein homogenes Gravitationsfeld und entsprechende Beschleunigung sind lokal nicht unterscheidbar.","Masse und Energie sind identisch als Zahlenwerte.","Nur Licht reagiert auf Gravitation."],"correct":1,"explanation":"In hinreichend kleinen Regionen kann ein frei fallendes System die Gravitation lokal eliminieren."},{"id":"r14","category":"RELATIVITÄT","question":"Welches Raumzeitintervall besitzt eine Lichtbahn?","answers":["zeitartig positiv in jeder Konvention","raumartig","nullartig","ein unendliches Intervall"],"correct":2,"explanation":"Licht bewegt sich auf Nullgeodäten; das Eigenintervall ist null."},{"id":"r15","category":"RELATIVITÄT","question":"Für einen ruhenden Beobachter außerhalb eines Schwarzschild-Schwarzen-Lochs skaliert die gravitative Zeitdilatation relativ zur Unendlichkeit mit...","answers":["sqrt(1-r_s/r)","1-r/r_s","sqrt(1+r_s/r)","r_s/r"],"correct":0,"explanation":"Für eine stationäre Uhr ist dτ=dt sqrt(1-r_s/r)."},{"id":"o01","category":"OPTIK","question":"Snells Brechungsgesetz lautet:","answers":["n1 sin(theta1)=n2 sin(theta2)","n1 cos(theta1)=n2 cos(theta2)","theta1/theta2=n1/n2 immer","n1 theta1=n2 theta2 exakt"],"correct":0,"explanation":"Die tangentiale Wellenvektorkomponente ist stetig, woraus Snells Gesetz folgt."},{"id":"o02","category":"OPTIK","question":"Für den Brewster-Winkel beim Übergang n1→n2 gilt:","answers":["sin theta_B=n2/n1","tan theta_B=n2/n1","cos theta_B=n2/n1","tan theta_B=n1/n2 immer"],"correct":1,"explanation":"Beim Brewster-Winkel verschwindet die p-polarisierte Reflexion: tan θ_B=n2/n1."},{"id":"o03","category":"WELLEN","question":"Die Gruppengeschwindigkeit eines Wellenpakets ist:","answers":["omega/k","d omega/d k","k/omega","d k/d omega"],"correct":1,"explanation":"v_g=dω/dk."},{"id":"o04","category":"WELLEN","question":"Die Phasengeschwindigkeit einer monochromatischen Welle ist:","answers":["d omega/d k","omega/k","k/omega","1/(omega k)"],"correct":1,"explanation":"v_p=ω/k."},{"id":"o05","category":"OPTIK","question":"Im Fraunhofer-Limes ist der Streifenabstand eines Doppelspalts mit Spaltabstand d auf einem Schirm in Abstand L näherungsweise:","answers":["lambda d/L","lambda L/d","dL/lambda","lambda/(dL)"],"correct":1,"explanation":"Für kleine Winkel ist Δy≈λL/d."},{"id":"o06","category":"OPTIK","question":"Der Winkelradius des ersten Minimums einer kreisförmigen Apertur mit Durchmesser D ist näherungsweise:","answers":["lambda/D","1.22 lambda/D","2 lambda/D","pi lambda/D"],"correct":1,"explanation":"Das Airy-Muster besitzt sein erstes Minimum bei etwa 1.22 λ/D."},{"id":"o07","category":"WELLEN","question":"Die Eigenfrequenzen einer beidseitig festen Saite der Länge L sind:","answers":["f_n=n v/(2L)","f_n=v/(nL)","f_n=2nL/v","f_n=n²v/L"],"correct":0,"explanation":"Es passen n halbe Wellenlängen auf die Saite."},{"id":"o08","category":"AKUSTIK","question":"Bei gleicher Impedanz ist die zeitlich gemittelte Schallintensität proportional zu...","answers":["der Druckamplitude.","dem Quadrat der Druckamplitude.","der inversen Druckamplitude.","der Frequenz allein."],"correct":1,"explanation":"Für harmonische Wellen ist I proportional p_amp²."},{"id":"o09","category":"OPTIK","question":"Malus' Gesetz für linear polarisiertes Licht hinter einem Analysator lautet:","answers":["I=I0 cos(theta)","I=I0 cos²(theta)","I=I0 sin(theta)","I=I0/theta²"],"correct":1,"explanation":"Die Feldprojektion liefert cos θ, die Intensität daher cos² θ."},{"id":"o10","category":"OPTIK","question":"Totalreflexion ist möglich, wenn...","answers":["n1<n2 und jeder Winkel genügt.","n1>n2 und der Einfallswinkel größer als arcsin(n2/n1) ist.","n1=n2.","der Einfallswinkel immer 0 ist."],"correct":1,"explanation":"Nur beim Übergang vom optisch dichteren ins dünnere Medium existiert ein kritischer Winkel."},{"id":"c01","category":"FESTKÖRPER","question":"Wie skaliert die Fermi-Energie eines dreidimensionalen freien Elektronengases mit Teilchendichte n?","answers":["n","n^(1/2)","n^(2/3)","1/n"],"correct":2,"explanation":"k_F proportional n^(1/3), daher E_F proportional k_F² proportional n^(2/3)."},{"id":"c02","category":"FESTKÖRPER","question":"Das magnetische Flussquant eines konventionellen Supraleiters beträgt:","answers":["h/e","h/(2e)","2h/e","hbar/e"],"correct":1,"explanation":"Cooper-Paare tragen Ladung 2e, daher Phi_0=h/(2e)."},{"id":"c03","category":"FESTKÖRPER","question":"Für einen einfachen Elektronenleiter mit Dichte n ist der Hall-Koeffizient im Drude-Modell:","answers":["+1/(ne)","-1/(ne)","ne","0"],"correct":1,"explanation":"Elektronen besitzen negative Ladung, daher R_H=-1/(ne)."},{"id":"c04","category":"FESTKÖRPER","question":"Braggs Beugungsbedingung für Netzebenenabstand d lautet:","answers":["d sin theta=n lambda","2d sin theta=n lambda","2d cos theta=lambda/n","d=lambda theta"],"correct":1,"explanation":"Der Gangunterschied benachbarter Ebenen ist 2d sin θ."},{"id":"c05","category":"FESTKÖRPER","question":"Wie verhält sich die Phononen-Wärmekapazität eines dreidimensionalen Debye-Festkörpers bei sehr tiefen Temperaturen?","answers":["C proportional T","C proportional T²","C proportional T³","C ist konstant"],"correct":2,"explanation":"Die lineare Phononendispersion in 3D führt zum Debye-T³-Gesetz."},{"id":"c06","category":"FESTKÖRPER","question":"Was bezeichnet die Bandlücke eines Halbleiters?","answers":["Den Abstand zwischen zwei Atomkernen.","Den Energiebereich ohne erlaubte Einteilchenzustände zwischen Valenz- und Leitungsband.","Die Breite des Leitungsbandes.","Die Fermi-Energie eines Metalls."],"correct":1,"explanation":"Die Bandlücke trennt Valenz- und Leitungsband."},{"id":"c07","category":"TEILCHENPHYSIK","question":"Welche Valenzquark-Zusammensetzung hat ein Proton?","answers":["udd","uud","uds","uuu"],"correct":1,"explanation":"Ein Proton enthält als Valenzquarks zwei up- und ein down-Quark."},{"id":"c08","category":"KERNPHYSIK","question":"Welcher Prozess beschreibt Beta-minus-Zerfall auf Quark-/Nukleonebene korrekt?","answers":["p→n+e+ + nu_e","n→p+e- + anti-nu_e","n→p+gamma","p→n+e- + nu_e"],"correct":1,"explanation":"Beim β−-Zerfall wird ein Neutron zu Proton, Elektron und Elektron-Antineutrino."},{"id":"c09","category":"TEILCHENPHYSIK","question":"Welche Austauschteilchen vermitteln geladene schwache Ströme?","answers":["Photonen","Gluonen","W+ und W-","Nur Z0"],"correct":2,"explanation":"Geladene schwache Wechselwirkungen werden durch W± vermittelt."},{"id":"c10","category":"KERNPHYSIK","question":"Ein Alpha-Teilchen ist...","answers":["ein einzelnes Proton.","ein Helium-4-Kern.","ein Elektron-Positron-Paar.","ein Deuteron."],"correct":1,"explanation":"Ein Alpha-Teilchen besteht aus zwei Protonen und zwei Neutronen."}];

  const state =
    window.__SIMON_ETH_STATE_V59__ ||
    window.__SIMON_ETH_STATE_V58__ ||
    window.__SIMON_ETH_STATE_V57__ ||
    window.__SIMON_ETH_STATE_V56__ ||
    window.__SIMON_ETH_STATE_V55__ ||
    window.__SIMON_ETH_STATE_V53__ ||
    window.__SIMON_ETH_STATE_V51__ || {
      einsteinIntroSeen: false,
      relativityBookRemarkSeen: false,
      seenQuestionIds: [],
      correctQuestionIds: []
    };

  if (!Array.isArray(state.seenQuestionIds)) state.seenQuestionIds = [];
  if (!Array.isArray(state.correctQuestionIds)) state.correctQuestionIds = [];

  window.__SIMON_ETH_STATE_V59__ = state;
  window.__SIMON_ETH_STATE_V58__ = state;
  window.__SIMON_ETH_STATE_V57__ = state;
  window.__SIMON_ETH_STATE_V56__ = state;
  window.__SIMON_ETH_STATE_V55__ = state;
  // Compatibility for earlier quest/debug code.
  window.__SIMON_ETH_STATE_V53__ = state;
  window.__SIMON_ETH_STATE_V51__ = state;

  // ---------------------------------------------------------------------------
  // Shared helpers
  // ---------------------------------------------------------------------------

  function getGame() {
    return (
      window.__SIMON_ACTIVE_GAME_V28__ ||
      window.__SIMON_ACTIVE_GAME_V20__ ||
      window.__SIMON_ACTIVE_GAME__ ||
      null
    );
  }

  function getScene(game, key) {
    try {
      return game?.scene?.getScene?.(key) || null;
    } catch {
      return null;
    }
  }

  function getBaseSceneClass() {
    return window.__SIMON_SCENE_CLASSES__?.MilchbuckScene || null;
  }

  function stopEvent(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    event?.stopImmediatePropagation?.();
  }

  function syncSharedState(scene) {
    const world = scene?.overworld;
    if (!scene || !world) return;

    world.inventory = scene.inventory;
    world.hotbarItems = scene.hotbarItems;
    world.selectedHotbarIndex = scene.selectedHotbarIndex;
    world.hasCityTicket = Boolean(scene.hasCityTicket);
    world.hasLongDistanceTicket = Boolean(scene.hasLongDistanceTicket);
    world.longDistanceTicketsUnlocked =
      Boolean(scene.longDistanceTicketsUnlocked);
    world.coins = Number(scene.coins) || 0;
    world.hp = Number(scene.hp) || 0;
    world.maxHp = Number(scene.maxHp) || 100;
    world.booksOwned = scene.booksOwned;
    world.booksRead = scene.booksRead;
    world.abilitiesUnlocked = scene.abilitiesUnlocked;
    world.purchasedAbilities = scene.purchasedAbilities;
    world.activeAbility = scene.activeAbility || null;
    world.forItselfCooldownUntil =
      Number(scene.forItselfCooldownUntil) || 0;
    world.sprintExpiresAt = Number(scene.sprintExpiresAt) || 0;

    world.updateCoinHUD?.();
    world.updateHpBar?.();
    world.updateInventoryUI?.();
    world.refreshHotbar?.();
    world.updateHotbarActionUI?.();
  }

  function copySharedState(scene, world) {
    scene.overworld = world || null;
    scene.inventory = world?.inventory || {
      gatorade: 0,
      monster: 0,
      camel: 0,
      gandhiSticks: 0
    };
    scene.hotbarItems = world?.hotbarItems || [null, null, null, null, null];
    scene.selectedHotbarIndex = Number(world?.selectedHotbarIndex) || 0;
    scene.hasCityTicket = Boolean(world?.hasCityTicket);
    scene.hasLongDistanceTicket = Boolean(world?.hasLongDistanceTicket);
    scene.longDistanceTicketsUnlocked =
      Boolean(world?.longDistanceTicketsUnlocked);
    scene.coins = Number(world?.coins) || 0;
    scene.hp = Number(world?.hp) || 100;
    scene.maxHp = Number(world?.maxHp) || 100;
    scene.booksOwned = world?.booksOwned || {};
    scene.booksRead = world?.booksRead || {};
    scene.abilitiesUnlocked = world?.abilitiesUnlocked || {};
    scene.purchasedAbilities = world?.purchasedAbilities || {};
    scene.activeAbility = world?.activeAbility || null;
    scene.forItselfCooldownUntil =
      Number(world?.forItselfCooldownUntil) || 0;
    scene.sprintExpiresAt = Number(world?.sprintExpiresAt) || 0;
    scene.developerMode = Boolean(world?.developerMode);
  }

  function cleanupEthDOM(scene) {
    scene?.__ethUiRoot?.remove?.();
    scene?.__ethQuizModal?.remove?.();
    scene?.__ethNotice?.remove?.();

    if (scene) {
      scene.__ethUiRoot = null;
      scene.__ethQuizModal = null;
      scene.__ethNotice = null;
    }
  }

  function setLocalUiVisible(scene, visible) {
    if (scene?.__ethUiRoot) {
      scene.__ethUiRoot.style.display = visible ? "block" : "none";
    }
  }

  function showLocalNotice(scene, title, detail = "", duration = 2400) {
    scene?.__ethNotice?.remove?.();

    const root = document.getElementById("phaser-game");
    if (!root) return;

    const node = document.createElement("div");
    node.dataset.simonUi = "eth-notice-v56";

    node.textContent = detail
      ? `${title}\n${detail}`
      : title;

    Object.assign(node.style, {
      position: "absolute",
      left: "50%",
      top: "42px",
      transform: "translateX(-50%)",
      zIndex: "540000",
      maxWidth: "82%",
      padding: "9px 13px",
      border: "3px solid #d5bf82",
      background: "rgba(24,28,32,.95)",
      color: "#fff2c4",
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "6px",
      lineHeight: "1.7",
      whiteSpace: "pre-line",
      textAlign: "center",
      pointerEvents: "none",
      boxShadow: "4px 4px 0 rgba(0,0,0,.42)"
    });

    root.appendChild(node);
    scene.__ethNotice = node;

    window.setTimeout(() => {
      node.remove();
      if (scene.__ethNotice === node) scene.__ethNotice = null;
    }, duration);
  }

  function createPixelButton(label, options = {}) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;

    Object.assign(button.style, {
      appearance: "none",
      border: options.border || "2px solid #d9cda8",
      background: options.background || "rgba(30,38,45,.94)",
      color: options.color || "#fff3ce",
      minWidth: options.minWidth || "42px",
      minHeight: options.minHeight || "36px",
      padding: options.padding || "5px 7px",
      fontFamily: '"Press Start 2P", monospace',
      fontSize: options.fontSize || "5px",
      lineHeight: "1.45",
      boxShadow: "3px 3px 0 rgba(0,0,0,.38)",
      cursor: "pointer",
      touchAction: "manipulation",
      WebkitTapHighlightColor: "transparent"
    });

    return button;
  }

  function pressButton(button, onDown, onUp) {
    const down = (event) => {
      stopEvent(event);
      onDown?.();
    };

    const up = (event) => {
      stopEvent(event);
      onUp?.();
    };

    button.addEventListener("pointerdown", down, { passive: false });
    button.addEventListener("pointerup", up, { passive: false });
    button.addEventListener("pointercancel", up, { passive: false });
    button.addEventListener("pointerleave", up, { passive: false });
  }

  function isSceneBusy(scene) {
    return Boolean(
      scene?.__ethTransitionActive ||
      scene?.__ethDialogueActive ||
      scene?.__ethQuizModal ||
      scene?.itemsModal ||
      scene?.itemInfoModal ||
      scene?.readingBook ||
      scene?.drinkingItem ||
      scene?.__ethItemBusy ||
      scene?.exiting
    );
  }

  // ---------------------------------------------------------------------------
  // Local UI / inventory / item use
  // ---------------------------------------------------------------------------

  function getSelectedItem(scene) {
    const index = Phaser.Math.Clamp(
      Number(scene.selectedHotbarIndex) || 0,
      0,
      4
    );

    const key = scene.hotbarItems?.[index] || null;
    const item = key ? scene.getItemDefinition?.(key) : null;

    return { index, key, item };
  }

  function indoorActionLabel(scene) {
    const { key, item } = getSelectedItem(scene);

    if (!key || !item || (scene.getItemCount?.(key) || 0) <= 0) {
      return "LEER";
    }

    if (key === "camel") return "RAUCHEN";
    if (key === "gatorade" || key === "monster") return "TRINKEN";
    if (item.type === "book") return "LESEN";

    return "—";
  }

  function refreshLocalHotbar(scene) {
    const host = scene?.__ethHotbarHost;
    if (!host) return;

    host.replaceChildren();

    for (let i = 0; i < 5; i += 1) {
      const key = scene.hotbarItems?.[i] || null;
      const selected = i === scene.selectedHotbarIndex;
      const slot = createPixelButton("", {
        minWidth: "34px",
        minHeight: "34px",
        padding: "1px",
        border: selected
          ? "3px solid #ffe08a"
          : "2px solid #747e84",
        background: selected ? "#4f4939" : "#222a30"
      });

      slot.style.width = "34px";
      slot.style.height = "34px";
      slot.style.position = "relative";

      if (key) {
        const icon = scene.createDOMItemIcon?.(key, 25);

        if (icon) {
          icon.style.pointerEvents = "none";
          slot.appendChild(icon);
        } else {
          slot.textContent = key.slice(0, 1).toUpperCase();
        }

        const count = scene.getItemCount?.(key) || 0;

        if (count > 1) {
          const qty = document.createElement("span");
          qty.textContent = String(count);

          Object.assign(qty.style, {
            position: "absolute",
            right: "2px",
            bottom: "1px",
            fontFamily: '"Press Start 2P", monospace',
            fontSize: "5px",
            color: "#ffffff",
            textShadow: "2px 2px #000"
          });

          slot.appendChild(qty);
        }
      }

      slot.addEventListener("click", (event) => {
        stopEvent(event);
        if (isSceneBusy(scene)) return;

        scene.selectedHotbarIndex = i;
        syncSharedState(scene);
        refreshLocalHotbar(scene);
      });

      host.appendChild(slot);
    }

    if (scene.__ethUseButton) {
      const label = indoorActionLabel(scene);
      scene.__ethUseButton.textContent = label;
      scene.__ethUseButton.disabled = label === "LEER" || label === "—";
      scene.__ethUseButton.style.opacity =
        scene.__ethUseButton.disabled ? "0.45" : "1";
    }
  }

  function animateSmallProp(scene, kind, color, done) {
    const player = scene.player;

    if (!player?.active) {
      done?.();
      return;
    }

    const x = player.x + (player.flipX ? -25 : 25);
    const y = player.y - 56;

    if (kind === "smoke") {
      const g = scene.add.graphics().setDepth(600);
      g.fillStyle(0xf2eee2, 1);
      g.fillRect(x - 8, y, 17, 4);
      g.fillStyle(0xd76f45, 1);
      g.fillRect(x + 9, y, 4, 4);

      const puffs = [0, 1, 2].map((i) =>
        scene.add.circle(
          x + 13 + i * 4,
          y - 7 - i * 7,
          3 + i,
          0xe5e5e5,
          0.72
        ).setDepth(601)
      );

      scene.tweens.add({
        targets: puffs,
        y: "-=19",
        alpha: 0,
        duration: 900,
        onComplete: () => {
          g.destroy();
          puffs.forEach((p) => p.destroy());
          done?.();
        }
      });

      return;
    }

    if (kind === "drink") {
      const can = scene.add.rectangle(x, y, 10, 22, color, 1)
        .setDepth(600);

      scene.tweens.add({
        targets: can,
        y: y - 18,
        angle: 25,
        duration: 250,
        yoyo: true,
        repeat: 2,
        onComplete: () => {
          can.destroy();
          done?.();
        }
      });

      return;
    }

    done?.();
  }

  function finishItemUse(scene) {
    scene.__ethItemBusy = false;
    scene.player?.play?.("simon-idle", true);
    syncSharedState(scene);
    refreshLocalHotbar(scene);
  }

  function useSelectedItem(scene) {
    if (!scene || isSceneBusy(scene)) return;

    const { key, item } = getSelectedItem(scene);

    if (!key || !item || (scene.getItemCount?.(key) || 0) <= 0) return;

    if (item.type === "book") {
      scene.__ethItemBusy = true;

      try {
        // Use the established book-reading implementation of the base scene.
        scene.playBookReadingAnimation?.(key);

        // v46 owns the Playbook flirt definitions. If this dynamic scene is
        // not one of v46's patched world scenes, repair the unlock through its
        // public API after the established reading animation had time to finish.
        if (item.bookKey === "playbook") {
          window.setTimeout(() => {
            const ids = window.SimonFlirtsV46?.PLAYBOOK_FLIRTS || [];

            ids.forEach((id) => {
              window.SimonFlirtsV46?.learn?.(id);
            });
          }, 1900);
        }

        window.setTimeout(() => {
          finishItemUse(scene);
        }, 2500);
      } catch (error) {
        console.error("ETH: Buch konnte nicht gelesen werden:", error);
        finishItemUse(scene);
      }

      return;
    }

    if (key === "camel") {
      scene.__ethItemBusy = true;

      animateSmallProp(scene, "smoke", 0xffffff, () => {
        scene.inventory.camel = Math.max(
          0,
          (Number(scene.getItemCount?.("camel")) || 0) - 1
        );

        const now = Date.now();
        const duration = Number(item.sprintMs) || 20000;

        scene.sprintExpiresAt =
          Math.max(now, Number(scene.sprintExpiresAt) || 0) + duration;

        if ((scene.getItemCount?.("camel") || 0) <= 0) {
          scene.removeItemFromHotbar?.("camel");
        }

        finishItemUse(scene);
      });

      return;
    }

    if (key === "gatorade" || key === "monster") {
      scene.__ethItemBusy = true;

      animateSmallProp(
        scene,
        "drink",
        key === "gatorade" ? 0x72afe4 : 0xef8b46,
        () => {
          scene.inventory[key] = Math.max(
            0,
            (Number(scene.getItemCount?.(key)) || 0) - 1
          );

          scene.hp = Math.min(
            Number(scene.maxHp) || 100,
            (Number(scene.hp) || 0) + (Number(item.heal) || 0)
          );

          if ((scene.getItemCount?.(key) || 0) <= 0) {
            scene.removeItemFromHotbar?.(key);
          }

          finishItemUse(scene);
        }
      );

      return;
    }

    showLocalNotice(scene, "HIER NICHT BENUTZBAR", item.name || key, 1600);
  }

  function patchFlirtTabForScene(scene) {
    if (scene.__ethFlirtTabPatched || typeof scene.renderItemsModalTab !== "function") {
      return;
    }

    scene.__ethFlirtTabPatched = true;

    const original = scene.renderItemsModalTab.bind(scene);

    scene.renderItemsModalTab = function renderItemsModalTabEthV51(...args) {
      if (this.itemsModalTab !== "flirts") {
        const result = original(...args);
        ensureFlirtTab(this);
        return result;
      }

      const content =
        this.itemsModalContent ||
        this.itemsModal?.panel?.querySelector?.("[data-items-content='true']");

      if (!content) return;

      content.replaceChildren();

      const flirts = window.SimonFlirtsV46?.getLearned?.() || [];

      if (!flirts.length) {
        const empty = document.createElement("div");
        empty.textContent = "NOCH KEINE FLIRTS GELERNT";
        Object.assign(empty.style, {
          padding: "18px 6px",
          color: "#b8bec4",
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "7px"
        });
        content.appendChild(empty);
      } else {
        const grid = document.createElement("div");
        Object.assign(grid.style, {
          display: "grid",
          gridTemplateColumns: "repeat(2,minmax(0,1fr))",
          gap: "8px"
        });

        flirts.forEach((flirt) => {
          const card = document.createElement("div");
          Object.assign(card.style, {
            padding: "8px",
            border: "2px solid #c783ad",
            background: "#272029",
            color: "#f7e7f0",
            fontFamily: '"Press Start 2P", monospace',
            fontSize: "5px",
            lineHeight: "1.65"
          });

          card.textContent =
            `${String(flirt.source || "").toUpperCase()}\n` +
            `${String(flirt.name || "").toUpperCase()}\n\n` +
            `${flirt.description || ""}`;

          grid.appendChild(card);
        });

        content.appendChild(grid);
      }

      ensureFlirtTab(this);
    };
  }

  function ensureFlirtTab(scene) {
    const panel = scene.itemsModal?.panel;
    if (!panel) return;

    if (panel.querySelector("[data-items-tab='flirts']")) return;

    const first = panel.querySelector("[data-items-tab='items']");
    const tabs = first?.parentElement;

    if (!tabs) return;

    tabs.style.gridTemplateColumns = "repeat(4,minmax(0,1fr))";

    const button = scene.createDOMButton?.(
      "FLIRTS",
      () => {
        scene.itemsModalTab = "flirts";
        scene.renderItemsModalTab?.();
      },
      {
        color: "#e8edf2",
        background: "#252c32",
        border: "#68727b",
        minHeight: "36px",
        fontSize: "5.4px"
      }
    );

    if (!button) return;

    button.dataset.itemsTab = "flirts";
    tabs.appendChild(button);
  }

  function openLocalInventory(scene) {
    if (!scene || isSceneBusy(scene) || typeof scene.openItemsModal !== "function") {
      return;
    }

    patchFlirtTabForScene(scene);

    scene.openItemsModal();
    window.setTimeout(() => ensureFlirtTab(scene), 0);
  }

  function buildLocalControls(scene, { showRideHint = false } = {}) {
    cleanupEthDOM(scene);

    const root = document.getElementById("phaser-game");
    if (!root) return;

    const ui = document.createElement("div");
    ui.dataset.simonUi = "eth-ui-v57";

    Object.assign(ui.style, {
      position: "absolute",
      inset: "0",
      zIndex: "510000",
      pointerEvents: "none",
      fontFamily: '"Press Start 2P", monospace'
    });

    // Hotbar top-center.
    const hotbar = document.createElement("div");
    Object.assign(hotbar.style, {
      position: "absolute",
      top: "7px",
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      gap: "3px",
      padding: "3px",
      background: "rgba(19,25,30,.78)",
      border: "2px solid rgba(233,220,178,.75)",
      pointerEvents: "auto"
    });

    scene.__ethHotbarHost = document.createElement("div");
    Object.assign(scene.__ethHotbarHost.style, {
      display: "flex",
      gap: "3px"
    });

    scene.__ethUseButton = createPixelButton("LEER", {
      minWidth: "70px",
      minHeight: "34px",
      background: "#43513a",
      border: "2px solid #d5c37d"
    });

    scene.__ethUseButton.addEventListener("click", (event) => {
      stopEvent(event);
      useSelectedItem(scene);
    });

    hotbar.append(scene.__ethHotbarHost, scene.__ethUseButton);

    const items = createPixelButton("ITEMS", {
      minWidth: "64px",
      minHeight: "34px",
      background: "#263846"
    });

    items.style.position = "absolute";
    items.style.top = "8px";
    items.style.right = "10px";
    items.style.pointerEvents = "auto";

    items.addEventListener("click", (event) => {
      stopEvent(event);
      openLocalInventory(scene);
    });

    // Movement controls.
    const left = createPixelButton("◀", {
      minWidth: "52px",
      minHeight: "45px",
      fontSize: "12px"
    });

    const right = createPixelButton("▶", {
      minWidth: "52px",
      minHeight: "45px",
      fontSize: "12px"
    });

    const jump = createPixelButton("↑", {
      minWidth: "52px",
      minHeight: "45px",
      fontSize: "12px"
    });

    const dance = createPixelButton("TANZ", {
      minWidth: "60px",
      minHeight: "45px",
      fontSize: "5px"
    });

    const move = document.createElement("div");
    Object.assign(move.style, {
      position: "absolute",
      left: "10px",
      bottom: "10px",
      display: "flex",
      gap: "7px",
      pointerEvents: "auto"
    });

    const actions = document.createElement("div");
    Object.assign(actions.style, {
      position: "absolute",
      right: "10px",
      bottom: "10px",
      display: "flex",
      gap: "7px",
      pointerEvents: "auto"
    });

    move.append(left, right);
    actions.append(dance, jump);

    pressButton(
      left,
      () => { if (!isSceneBusy(scene)) scene.touchLeft = true; },
      () => { scene.touchLeft = false; }
    );

    pressButton(
      right,
      () => { if (!isSceneBusy(scene)) scene.touchRight = true; },
      () => { scene.touchRight = false; }
    );

    pressButton(
      jump,
      () => {
        if (!isSceneBusy(scene)) scene.touchJumpRequested = true;
      },
      () => {}
    );

    dance.addEventListener("click", (event) => {
      stopEvent(event);
      if (!isSceneBusy(scene)) scene.__ethDanceRequested = true;
    });

    ui.append(hotbar, items, move, actions);

    if (showRideHint) {
      const hint = document.createElement("div");
      hint.textContent = "W / ↑ = SPRINGEN · SPACE = TANZEN";
      Object.assign(hint.style, {
        position: "absolute",
        bottom: "9px",
        left: "50%",
        transform: "translateX(-50%)",
        color: "rgba(255,244,208,.72)",
        fontSize: "4.5px",
        pointerEvents: "none",
        whiteSpace: "nowrap"
      });
      ui.appendChild(hint);
    }

    root.appendChild(ui);
    scene.__ethUiRoot = ui;

    refreshLocalHotbar(scene);
  }

  // ---------------------------------------------------------------------------
  // Shared movement
  // ---------------------------------------------------------------------------

  function createEthPlayer(scene, x, y) {
    scene.createAnimations?.();
    scene.createPlayer?.();

    scene.player.setPosition(x, y);
    scene.player.setScale?.(0.42);
    scene.player.setVelocity?.(0, 0);

    // Base keyboard setup gives us the same A/D/W and cursor objects as outside.
    scene.createKeyboardControls?.();

    scene.__ethDanceKey =
      scene.input.keyboard?.addKey?.(Phaser.Input.Keyboard.KeyCodes.SPACE) || null;

    scene.touchLeft = false;
    scene.touchRight = false;
    scene.touchJumpRequested = false;
    scene.__ethDanceRequested = false;
    scene.__ethDancingUntil = 0;
  }

  function updateEthMovement(scene, time) {
    if (!scene.player?.body || scene.exiting) return;

    if (isSceneBusy(scene)) {
      scene.player.setVelocityX(0);
      return;
    }

    const body = scene.player.body;
    const onGround = body.blocked.down || body.touching.down;

    const leftDown =
      Boolean(scene.cursors?.left?.isDown) ||
      Boolean(scene.keyA?.isDown) ||
      scene.touchLeft;

    const rightDown =
      Boolean(scene.cursors?.right?.isDown) ||
      Boolean(scene.keyD?.isDown) ||
      scene.touchRight;

    const dancePressed =
      Boolean(
        scene.__ethDanceKey &&
        Phaser.Input.Keyboard.JustDown(scene.__ethDanceKey)
      ) ||
      scene.__ethDanceRequested;

    scene.__ethDanceRequested = false;

    if (dancePressed && onGround) {
      scene.__ethDancingUntil = time + 900;
      scene.player.setVelocityX(0);

      if (scene.anims?.exists?.("simon-v14-dance")) {
        scene.player.setScale(0.52);
        scene.player.play("simon-v14-dance", true);
      } else {
        scene.player.play("simon-idle", true);

        scene.tweens.add({
          targets: scene.player,
          angle: { from: -5, to: 5 },
          y: scene.player.y - 4,
          duration: 180,
          yoyo: true,
          repeat: 1,
          onComplete: () => scene.player?.setAngle?.(0)
        });
      }

      return;
    }

    if (time < scene.__ethDancingUntil) {
      scene.player.setVelocityX(0);
      return;
    }

    if (scene.player.scaleX && Math.abs(scene.player.scaleX) > 0.48) {
      scene.player.setScale(0.42);
    }

    let direction = 0;
    if (leftDown && !rightDown) direction = -1;
    if (rightDown && !leftDown) direction = 1;

    const sprint =
      typeof scene.isSprintActive === "function"
        ? scene.isSprintActive()
        : Date.now() < (Number(scene.sprintExpiresAt) || 0);

    const speed = sprint ? 245 : 175;

    scene.player.setVelocityX(direction * speed);

    if (direction !== 0) {
      scene.facing = direction;
      scene.player.setFlipX(direction < 0);
    }

    const jumpPressed =
      Boolean(
        scene.cursors?.up &&
        Phaser.Input.Keyboard.JustDown(scene.cursors.up)
      ) ||
      Boolean(
        scene.keyW &&
        Phaser.Input.Keyboard.JustDown(scene.keyW)
      ) ||
      scene.touchJumpRequested;

    scene.touchJumpRequested = false;

    if (jumpPressed && onGround) {
      scene.player.setVelocityY(-470);

      if (scene.anims?.exists?.("simon-jump")) {
        scene.player.play("simon-jump", true);
      }
    } else if (onGround) {
      scene.player.play(
        direction === 0 ? "simon-idle" : "simon-run",
        true
      );
    }
  }

  // ---------------------------------------------------------------------------
  
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // Bahnhofstrasse Polybahn — direct world interaction next to the locker.
  // No Central walking scene anymore.
  // ---------------------------------------------------------------------------

  function canUsePolybahn(scene) {
    return Boolean(
      scene?.sys?.isActive?.() &&
      scene.player?.active &&
      !scene.uiLocked &&
      !scene.playerDying &&
      !scene.tramTransitActive &&
      !scene.itemsModal &&
      !scene.itemInfoModal &&
      !scene.ticketModal &&
      !scene.__sv37LockerModal &&
      !scene.__sv37ZofingiaOpen &&
      !scene.__sv36ZofingiaOpen &&
      !scene.milkmanDialogueActive &&
      !scene.milkmanFightActive &&
      !scene.gandhiDialogueActive &&
      !scene.darkGandhiBossActive &&
      !scene.__polybahnTravelActiveV57 &&
      polybahnStoryUnlocked(scene)
    );
  }

  function getPolybahnBahnhofX() {
    return POLYBAHN_BAHNHOF_X;
  }

  function cashierStateV56() {
    return (
      window.__SIMON_CASHIER_STATE_V54__ ||
      window.SimonCashierV54?.state ||
      null
    );
  }

  function polybahnStoryUnlocked(scene) {
    if (scene?.developerMode) return true;

    const cashier = cashierStateV56();

    return Boolean(
      cashier?.inspirationHintSeen ||
      cashier?.needsInspiration ||
      cashier?.coffeePlanWritten ||
      cashier?.cashierAsked ||
      cashier?.cashierRejected
    );
  }

  function refreshCampusEntryAvailability(scene) {
    const entry = scene?.__ethCampusEntryV59;
    if (!entry) return;

    const unlocked = polybahnStoryUnlocked(scene);

    if (entry.zone?.input) {
      entry.zone.input.enabled = unlocked;
      entry.zone.input.cursor =
        unlocked ? "pointer" : "default";
    }

    if (entry.actionLabel?.input) {
      entry.actionLabel.input.enabled = unlocked;
      entry.actionLabel.input.cursor =
        unlocked ? "pointer" : "default";
    }

    entry.actionLabel?.setVisible?.(unlocked);

    if (unlocked) {
      entry.station?.setAlpha?.(1);
      entry.sign?.setAlpha?.(1);

      if (!entry.marker?.active) {
        // The station itself sits in the visual background. The interaction
        // marker belongs at the MOUTH of the side street where Simon stands.
        entry.marker =
          scene.createPulsingInteractionMarker?.(
            entry.x,
            284,
            176
          ) || null;
      }
    } else {
      // Visible as background architecture, but completely silent.
      entry.station?.setAlpha?.(0.72);
      entry.sign?.setAlpha?.(0.72);

      if (entry.marker?.active) {
        scene.tweens?.killTweensOf?.(
          entry.marker
        );
        entry.marker.destroy?.();
      }

      entry.marker = null;
    }
  }

  function destroyBahnhofPolybahn(scene) {
    const entry = scene?.__ethCampusEntryV59;
    if (!entry) return;

    entry.street?.destroy?.();
    entry.station?.destroy?.(true);
    entry.sign?.destroy?.();
    entry.zone?.destroy?.();
    entry.marker?.destroy?.();
    entry.actionLabel?.destroy?.();

    scene.__ethCampusEntryV59 = null;
  }

  function createCampusEntry(scene) {
    if (!scene || scene.__ethCampusEntryV59) return;

    const x = getPolybahnBahnhofX();

    // ---------------------------------------------------------------
    // SIDE STREET / PERSPECTIVE
    // ---------------------------------------------------------------
    // Rather than putting the lower station directly on Bahnhofstrasse,
    // show a short road leading away from the foreground. This visually
    // communicates "Central is a little further in that direction" while
    // keeping everything on the same gameplay scene.
    const street = scene.add.graphics().setDepth(1);

    // Street opening at the foreground, narrowing into the background.
    street.fillStyle(0x6a6b68, 1);
    street.beginPath();
    street.moveTo(x - 82, GROUND_TOP);
    street.lineTo(x + 82, GROUND_TOP);
    street.lineTo(x + 31, 194);
    street.lineTo(x - 31, 194);
    street.closePath();
    street.fillPath();

    // Pale sidewalks on both sides of the receding road.
    street.fillStyle(0xbab1a1, 1);

    street.beginPath();
    street.moveTo(x - 113, GROUND_TOP);
    street.lineTo(x - 82, GROUND_TOP);
    street.lineTo(x - 31, 194);
    street.lineTo(x - 47, 194);
    street.closePath();
    street.fillPath();

    street.beginPath();
    street.moveTo(x + 82, GROUND_TOP);
    street.lineTo(x + 113, GROUND_TOP);
    street.lineTo(x + 47, 194);
    street.lineTo(x + 31, 194);
    street.closePath();
    street.fillPath();

    // Perspective paving / road lines.
    street.lineStyle(2, 0x4e504e, 0.65);
    [
      [0.13, 11],
      [0.30, 9],
      [0.50, 7],
      [0.70, 5]
    ].forEach(([ratio, half]) => {
      const y =
        194 +
        (GROUND_TOP - 194) * ratio;

      street.lineBetween(
        x - half,
        y,
        x + half,
        y
      );
    });

    // Narrow flanking city facades make the little street feel embedded in
    // Central instead of like a portal dropped onto Bahnhofstrasse.
    street.fillStyle(0xa79d8f, 1);
    street.fillRect(
      x - 118,
      112,
      69,
      117
    );
    street.fillStyle(0xb7ac9b, 1);
    street.fillRect(
      x + 49,
      103,
      78,
      126
    );

    street.fillStyle(0x405862, 1);
    [
      [x - 103, 137],
      [x - 75, 137],
      [x + 62, 130],
      [x + 95, 130]
    ].forEach(([wx, wy]) => {
      street.fillRect(
        wx,
        wy,
        17,
        24
      );
      street.fillRect(
        wx,
        wy + 39,
        17,
        24
      );
    });

    // ---------------------------------------------------------------
    // SMALL POLYBAHN STATION AT THE END OF THE STREET
    // ---------------------------------------------------------------
    const station =
      scene.add.container(0, 0)
        .setDepth(3);

    const g = scene.add.graphics();

    // Deliberately smaller than v58: it is visually further away.
    g.fillStyle(0xb9ae9d, 1);
    g.fillRoundedRect(
      x - 45,
      116,
      90,
      91,
      5
    );

    g.fillStyle(0x968b7e, 1);
    g.fillRect(
      x - 49,
      111,
      98,
      8
    );

    g.fillStyle(0xb62e31, 1);
    g.fillRoundedRect(
      x - 40,
      142,
      80,
      23,
      4
    );

    g.fillStyle(0x233b43, 1);
    g.fillCircle(
      x,
      190,
      27
    );
    g.fillRect(
      x - 27,
      190,
      54,
      22
    );

    g.fillStyle(0x172c34, 1);
    g.fillCircle(
      x,
      192,
      20
    );
    g.fillRect(
      x - 20,
      192,
      40,
      20
    );

    g.lineStyle(3, 0xd7cbb7, 1);
    g.strokeCircle(
      x,
      190,
      27
    );

    // Tiny funicular symbol.
    g.fillStyle(0xc83b3d, 1);
    g.fillRoundedRect(
      x - 13,
      169,
      26,
      14,
      3
    );
    g.fillStyle(0xe1eceb, 1);
    g.fillRect(x - 9, 173, 6, 5);
    g.fillRect(x + 3, 173, 6, 5);

    station.add(g);

    const sign = scene.add.text(
      x,
      153,
      "POLYBAHN",
      {
        fontFamily:
          '"Press Start 2P", monospace',
        fontSize: "5px",
        color: "#fff0d0",
        stroke: "#682024",
        strokeThickness: 2
      }
    )
      .setOrigin(0.5)
      .setDepth(5);

    // ---------------------------------------------------------------
    // INTERACTION AT THE STREET MOUTH
    // ---------------------------------------------------------------
    const zone = scene.add.zone(
      x,
      267,
      150,
      135
    )
      .setDepth(285)
      .setInteractive({
        useHandCursor: true
      });

    const actionLabel = scene.add.text(
      x,
      257,
      "POLYBAHN ↑",
      {
        fontFamily:
          '"Press Start 2P", monospace',
        fontSize: "6px",
        color: "#fff0c9",
        backgroundColor: "#853031",
        padding: {
          x: 7,
          y: 5
        }
      }
    )
      .setOrigin(0.5)
      .setDepth(286)
      .setVisible(false)
      .setInteractive({
        useHandCursor: true
      });

    const enter = (pointer) => {
      stopEvent(pointer?.event);

      if (!canUsePolybahn(scene)) {
        return;
      }

      startPolybahnFromBahnhof(scene);
    };

    zone.on(
      "pointerdown",
      enter
    );

    actionLabel.on(
      "pointerdown",
      enter
    );

    scene.__ethCampusEntryV59 = {
      x,
      street,
      station,
      sign,
      zone,
      actionLabel,
      marker: null
    };

    refreshCampusEntryAvailability(scene);

    scene.events?.once?.(
      "shutdown",
      () => {
        scene.__ethCampusEntryV59 = null;
      }
    );
  }

  function snapshotBahnhofForPolybahn(station) {
    return {
      developerMode: Boolean(station?.developerMode),
      coins: Number(station?.coins) || 0,
      hp: Number(station?.hp) || 100,
      maxHp: Number(station?.maxHp) || 100,

      hasCityTicket: Boolean(station?.hasCityTicket),
      hasLongDistanceTicket:
        Boolean(station?.hasLongDistanceTicket),
      longDistanceTicketsUnlocked:
        Boolean(station?.longDistanceTicketsUnlocked),

      inventory: { ...(station?.inventory || {}) },
      hotbarItems: Array.isArray(station?.hotbarItems)
        ? [...station.hotbarItems]
        : [null, null, null, null, null],
      selectedHotbarIndex:
        Number(station?.selectedHotbarIndex) || 0,

      booksOwned: { ...(station?.booksOwned || {}) },
      booksRead: { ...(station?.booksRead || {}) },
      abilitiesUnlocked: {
        ...(station?.abilitiesUnlocked || {})
      },
      activeAbility: station?.activeAbility || null,
      forItselfCooldownUntil:
        Number(station?.forItselfCooldownUntil) || 0,
      sprintExpiresAt:
        Number(station?.sprintExpiresAt) || 0,

      gandhiStoryEligible:
        Boolean(station?.gandhiStoryEligible),
      gandhiEncounterFinished:
        Boolean(station?.gandhiEncounterFinished),
      gandhiDead:
        Boolean(station?.gandhiDead),
      darkGandhiDefeated:
        Boolean(station?.darkGandhiDefeated),
      gandhiPassOriginSide:
        station?.gandhiPassOriginSide || null,
      gandhiPassEnteredZone:
        Boolean(station?.gandhiPassEnteredZone),
      gandhiPassCompleted:
        Boolean(station?.gandhiPassCompleted),
      gandhiSticksLooted:
        Boolean(station?.gandhiSticksLooted),

      enriqueSpoken:
        Boolean(station?.enriqueSpoken),

      amsifEncounterStarted:
        Boolean(station?.amsifEncounterStarted),
      amsifIntroCompleted:
        Boolean(station?.amsifIntroCompleted),
      amsifStoryCompleted:
        Boolean(station?.amsifStoryCompleted),

      hiveWalletFound:
        Boolean(station?.hiveWalletFound),
      brouwersCount:
        Number(station?.brouwersCount) || 0,
      drunkDoseExpiries:
        Array.isArray(station?.drunkDoseExpiries)
          ? [...station.drunkDoseExpiries]
          : (
              Array.isArray(window.__SIMON_DRUNK_DOSES__)
                ? [...window.__SIMON_DRUNK_DOSES__]
                : []
            )
    };
  }

  function bahnhofDataFromPolybahn(world) {
    return {
      ...(world || {}),
      arrivalFrom: "polybahn",
      hasCityTicket:
        Boolean(world?.hasCityTicket)
    };
  }

  function setOutdoorSceneUiVisible(
    scene,
    visible,
    {
      canonicalHotbar = true
    } = {}
  ) {
    if (!scene) return;

    const value = Boolean(visible);

    scene.hudContainer?.setVisible?.(value);
    scene.itemsButton?.setVisible?.(value);

    (scene.controlObjects || []).forEach((object) => {
      object?.setVisible?.(value);
      if (object?.input) object.input.enabled = value;
    });

    (scene.abilityControlObjects || []).forEach((object) => {
      object?.setVisible?.(value);
      if (object?.input) object.input.enabled = value;
    });

    (scene.weaponControlObjects || []).forEach((object) => {
      object?.setVisible?.(value);
      if (object?.input) object.input.enabled = value;
    });

    const domRefs = [
      ...(canonicalHotbar
        ? [scene.hotbarDOM, scene.hotbarActionUI]
        : []),
      scene.sprintIndicatorDOM,
      scene.abilityIndicatorDOM,
      scene.abilityUnlockBannerDOM
    ];

    domRefs
      .map((ref) => ref?.overlay || ref)
      .filter((node) => node?.style)
      .forEach((node) => {
        node.style.display = value ? "" : "none";
        node.style.pointerEvents = value ? "" : "none";
      });
  }

  function startPolybahnFromBahnhof(station) {
    if (!canUsePolybahn(station)) return false;

    const game = getGame() || station.game;
    if (!game?.scene) return false;

    install(game);

    if (
      !game.scene.keys?.[TRANSIT_KEY] ||
      !game.scene.keys?.[TERRACE_KEY]
    ) {
      console.error("ETH v59: Polybahn-Szenen fehlen.");
      return false;
    }

    const world =
      snapshotBahnhofForPolybahn(station);

    station.__ethCampusEnteringV57 = true;
    station.player?.setVelocity?.(0, 0);
    station.setUILocked?.(true);
    setOutdoorSceneUiVisible(station, false);
    station.cameras?.main?.fadeOut?.(160, 0, 0, 0);

    station.time?.delayedCall?.(180, () => {
      if (!station.sys?.isActive?.()) return;

      try {
        // No paused Bahnhof remains behind the Polybahn.
        // ScenePlugin.start atomically shuts down Bahnhof and starts transit.
        station.scene.start(TRANSIT_KEY, {
          overworld: world,
          direction: "up"
        });
      } catch (error) {
        console.error(
          "ETH v59: Polybahn-Start fehlgeschlagen:",
          error
        );

        station.cameras?.main?.resetFX?.();
        station.__ethCampusEnteringV57 = false;
        station.uiLocked = false;
        station.setUILocked?.(false);
        station.refreshUILock?.();
        setOutdoorSceneUiVisible(station, true);
      }
    });

    return true;
  }

  // ---------------------------------------------------------------------------
  // Direct Polybahn transit animation.
  //
  // The player never walks on a fake diagonal floor. A click at Bahnhofstrasse
  // starts this transit immediately, analogous to a tram journey.
  // ---------------------------------------------------------------------------

  class PolybahnTransitScene extends Phaser.Scene {
    constructor() {
      super(TRANSIT_KEY);
      this.overworld = null;
      this.direction = "up";
      this.__finishedV56 = false;
      this.__startedAtV56 = 0;
    }

    init(data = {}) {
      this.overworld = data.overworld || null;
      this.direction = data.direction === "down" ? "down" : "up";
      this.__finishedV56 = false;
      this.__startedAtV56 = 0;
    }

    create() {
      this.cameras.main.setBackgroundColor("#9fb8c2");
      this.cameras.main.resetFX();
      this.cameras.main.fadeIn(150, 0, 0, 0);

      this.createTransitVisuals();
      this.__startedAtV56 = performance.now();

      this.time.delayedCall(220, () => this.startTransit());

      // Hard failsafe. Even if a tween callback is lost, the game cannot remain
      // trapped inside the Polybahn scene.
      this.time.delayedCall(5200, () => {
        if (
          this.sys?.isActive?.() &&
          !this.__finishedV56
        ) {
          console.warn("ETH v59: Polybahn-Transit per Failsafe beendet.");
          this.finishTransit();
        }
      });

      this.events.once("shutdown", () => {
        this.tweens.killAll?.();
      });
    }

    createTransitVisuals() {
      const bg = this.add.graphics().setDepth(-30);

      bg.fillStyle(0xa3bdc6, 1);
      bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // City and hillside stay readable, but this is explicitly a cutscene,
      // not a playable platform.
      bg.fillStyle(0x728e83, 0.76);
      bg.fillTriangle(-30, 300, 250, 127, 540, 300);
      bg.fillTriangle(350, 300, 650, 149, 920, 300);

      bg.fillStyle(0x688f9e, 0.75);
      bg.fillRect(0, 275, 440, 80);

      const houses = this.add.container(0, 0).setDepth(-15);
      const hg = this.add.graphics();

      const colors = [0xb8a68f, 0xc5b39a, 0xa09080, 0xb8a38d];

      for (let i = 0; i < 9; i += 1) {
        const x = -35 + i * 104;
        const y = 205 - i * 10;
        const h = 104 + (i % 3) * 13;

        hg.fillStyle(colors[i % colors.length], 1);
        hg.fillRect(x, y, 91, h);

        hg.fillStyle(0x4c575c, 1);
        for (let wy = y + 23; wy < y + h - 15; wy += 34) {
          hg.fillRect(x + 16, wy, 14, 20);
          hg.fillRect(x + 53, wy, 14, 20);
        }
      }

      houses.add(hg);
      this.__transitHousesV56 = houses;

      // Fixed diagonal rail gives the carriage a clear physical reference.
      const rail = this.add.graphics().setDepth(2);

      rail.lineStyle(9, 0x4f4d49, 1);
      rail.lineBetween(145, 336, 680, 78);

      rail.lineStyle(3, 0xd6cab5, 1);
      rail.lineBetween(136, 339, 671, 81);
      rail.lineBetween(154, 333, 689, 75);

      for (let t = 0.02; t < 0.98; t += 0.055) {
        const x = Phaser.Math.Linear(145, 680, t);
        const y = Phaser.Math.Linear(336, 78, t);

        rail.lineStyle(3, 0x41413e, 1);
        rail.lineBetween(x - 15, y + 5, x + 15, y - 5);
      }

      const cabin = this.add.container(0, 0).setDepth(35);
      const cg = this.add.graphics();

      cg.fillStyle(0xb72f31, 1);
      cg.fillRoundedRect(-58, -45, 116, 86, 8);

      cg.lineStyle(4, 0xf1dfc5, 1);
      cg.strokeRoundedRect(-58, -45, 116, 86, 8);

      cg.fillStyle(0x29464f, 1);
      cg.fillRect(-44, -32, 32, 34);
      cg.fillRect(12, -32, 32, 34);

      cg.fillStyle(0xe7d9bf, 1);
      cg.fillRect(-5, -38, 10, 72);

      cg.fillStyle(0x3c3b3a, 1);
      cg.fillCircle(-34, 44, 10);
      cg.fillCircle(34, 44, 10);

      cabin.add(cg);

      if (this.textures.exists("simon")) {
        const simon = this.add.sprite(0, 12, "simon", 0)
          .setScale(0.19)
          .setOrigin(0.5, 1);

        cabin.add(simon);
      }

      const up = this.direction === "up";
      cabin.setPosition(
        up ? 145 : 680,
        up ? 318 : 60
      );

      this.__transitCabinV56 = cabin;

      this.add.text(
        GAME_WIDTH / 2,
        28,
        up
          ? "POLYBAHN · POLYTERRASSE"
          : "POLYBAHN · BAHNHOFSTRASSE",
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "6px",
          color: "#fff1d1",
          stroke: "#373c3e",
          strokeThickness: 4
        }
      )
        .setOrigin(0.5)
        .setDepth(60);
    }

    startTransit() {
      if (this.__finishedV56) return;

      const up = this.direction === "up";
      const target = up
        ? { x: 680, y: 60 }
        : { x: 145, y: 318 };

      this.tweens.add({
        targets: this.__transitHousesV56,
        y: up ? 74 : -74,
        x: up ? -22 : 22,
        duration: 2850,
        ease: "Sine.easeInOut"
      });

      this.tweens.add({
        targets: this.__transitCabinV56,
        x: target.x,
        y: target.y,
        duration: 2850,
        ease: "Sine.easeInOut",
        onComplete: () => this.finishTransit()
      });
    }

    finishTransit() {
      if (this.__finishedV56) return;
      this.__finishedV56 = true;

      const world = this.overworld;
      const up = this.direction === "up";

      this.cameras.main.fadeOut(140, 0, 0, 0);

      this.time.delayedCall(155, () => {
        try {
          if (up) {
            this.scene.start(TERRACE_KEY, {
              overworld: world,
              spawn: "polybahn"
            });
            return;
          }

          // Fresh Bahnhof scene: no paused scene can remain stuck.
          this.scene.start(
            "BahnhofquaiScene",
            bahnhofDataFromPolybahn(world)
          );
        } catch (error) {
          console.error(
            "ETH v59: Polybahn-Ende fehlgeschlagen:",
            error
          );

          try {
            this.scene.start(
              "BahnhofquaiScene",
              bahnhofDataFromPolybahn(world)
            );
          } catch {}
        }
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Polyterrasse — OUTDOOR scene.
  //
  // It deliberately uses the base game's normal movement, HUD, touch controls,
  // inventory and abilities. It is NOT an interior and Stability v47 therefore
  // no longer hides the outdoor hotbar here.
  // ---------------------------------------------------------------------------

  let BaseScene = getBaseSceneClass();

  class PolyterrasseScene extends (BaseScene || Phaser.Scene) {
    constructor() {
      super(TERRACE_KEY);
      this.__simonInteriorScene = false;
      this.overworld = null;
      this.exiting = false;
    }

    init(data = {}) {
      // MilchbuckScene.init({}) performs the reusable-scene cleanup phase and
      // returns before changing persistent travel state because arrivalFrom is
      // absent. This prevents duplicate/stale controls on repeated visits.
      super.init?.({});

      this.__simonInteriorScene = false;
      this.exiting = false;
      this.__ethTransitionActive = false;
      this.__ethDialogueActive = false;
      this.__ethItemBusy = false;
      this.spawn = data.spawn || "polybahn";

      copySharedState(this, data.overworld || null);

      this.currentStationKey = "polyterrasse";
      this.arrivalFinished = true;
      this.tramBoardingEnabled = false;
      this.tramTransitActive = false;
    }

    create() {
      this.input.addPointer(3);
      this.input.setTopOnly(true);

      this.physics.world.resume();
      this.physics.world.setBounds(0, 0, TERRACE_WIDTH, GAME_HEIGHT);
      this.cameras.main.setBounds(0, 0, TERRACE_WIDTH, GAME_HEIGHT);
      this.cameras.main.setBackgroundColor("#a4bec9");
      this.cameras.main.resetFX();
      this.cameras.main.fadeIn(190, 0, 0, 0);

      this.createTerraceArchitecture();

      this.ground = this.add.rectangle(
        TERRACE_WIDTH / 2,
        GROUND_TOP + (GAME_HEIGHT - GROUND_TOP) / 2,
        TERRACE_WIDTH,
        GAME_HEIGHT - GROUND_TOP,
        0x000000,
        0
      );

      this.physics.add.existing(this.ground, true);

      // Exact same basic outdoor toolchain as Milchbuck/Bahnhofstrasse.
      this.createAnimations?.();
      this.createPlayer?.();

      this.player?.setPosition?.(
        this.spawn === "eth" ? 1375 : 320,
        235
      );
      this.player?.setVelocity?.(0, 0);

      this.createKeyboardControls?.();
      this.createTouchControls?.();
      this.createHUD?.();
      this.installWormholeInput?.();

      this.createUpperStation();
      this.createEthEntrance();

      this.cameras.main.startFollow(this.player, true, 0.11, 0.11);
      this.cameras.main.setDeadzone(240, 80);
      this.cameras.main.roundPixels = true;

      this.events.once("shutdown", () => {
        syncSharedState(this);
        cleanupEthDOM(this);

        this.cleanupHotbarDOM?.();
        this.cleanupSprintIndicator?.();

        (this.hotbarActionUI?.overlay || this.hotbarActionUI)
          ?.remove?.();

        (this.abilityIndicatorDOM?.overlay || this.abilityIndicatorDOM)
          ?.remove?.();

        (this.abilityUnlockBannerDOM?.overlay || this.abilityUnlockBannerDOM)
          ?.remove?.();

        this.hotbarActionUI = null;
        this.abilityIndicatorDOM = null;
        this.abilityUnlockBannerDOM = null;
        this.overworld = null;
      });
    }

    createTerraceArchitecture() {
      const bg = this.add.graphics().setDepth(-30);

      bg.fillStyle(0xa2bdc8, 1);
      bg.fillRect(0, 0, TERRACE_WIDTH, 152);

      // Uetliberg / horizon.
      bg.fillStyle(0x718d82, 0.72);
      bg.fillTriangle(-80, 236, 240, 118, 570, 236);
      bg.fillTriangle(330, 236, 720, 139, 1110, 236);
      bg.fillTriangle(990, 236, 1370, 128, 1800, 236);

      // Zürich panorama below the terrace.
      bg.fillStyle(0x6e9aa8, 0.8);
      bg.fillRect(0, 225, 810, 53);

      bg.fillStyle(0x707777, 0.78);
      for (let x = 0; x < 1110; x += 43) {
        const h = 29 + ((x / 43) % 4) * 9;
        bg.fillRect(x, 225 - h, 37, h);
        bg.fillTriangle(x - 2, 225 - h, x + 18, 211 - h, x + 39, 225 - h);
      }

      // Grossmünster-ish twin towers.
      [515, 553].forEach((x) => {
        bg.fillRect(x, 132, 26, 93);
        bg.fillTriangle(x - 3, 132, x + 13, 99, x + 29, 132);
      });

      // Terrace balustrade.
      bg.fillStyle(0x747471, 1);
      bg.fillRect(0, 246, 920, 9);

      for (let x = 10; x < 915; x += 23) {
        bg.fillRect(x, 254, 6, 22);
      }

      // Real terrace paving, not an indoor floor stripe.
      bg.fillStyle(0xb2ada4, 1);
      bg.fillRect(0, 276, TERRACE_WIDTH, 62);

      bg.fillStyle(0xc9c4ba, 1);
      bg.fillRect(0, 286, TERRACE_WIDTH, 52);

      bg.fillStyle(0xd4cfc5, 1);
      bg.fillRect(0, 286, TERRACE_WIDTH, 7);

      bg.lineStyle(1, 0x99958e, 0.72);
      for (let y = 300; y < 338; y += 18) {
        bg.lineBetween(0, y, TERRACE_WIDTH, y);
      }

      for (let row = 0, y = 292; y < 338; row += 1, y += 18) {
        const offset = row % 2 ? 34 : 0;

        for (let x = offset; x < TERRACE_WIDTH; x += 68) {
          bg.lineBetween(x, y, x, Math.min(338, y + 18));
        }
      }

      // Upper Polybahn station.
      bg.fillStyle(0x77736d, 1);
      bg.fillRoundedRect(34, 128, 260, 158, 6);

      bg.fillStyle(0xb63232, 1);
      bg.fillRect(34, 156, 260, 31);

      bg.fillStyle(0x334b53, 1);
      bg.fillRoundedRect(83, 198, 162, 88, 10);

      this.add.text(
        164,
        171,
        "POLYBAHN",
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "7px",
          color: "#fff0d4"
        }
      )
        .setOrigin(0.5)
        .setDepth(3);

      // Open Zürich panorama continues here. The only university
      // architecture in this gameplay scene is ETH itself.

      // ETH main building.
      const eth = this.add.graphics().setDepth(-4);
      const left = 1230;
      const top = 60;
      const width = 455;

      eth.fillStyle(0xc8bdab, 1);
      eth.fillRect(left, top, width, 226);

      eth.fillStyle(0xa49c8f, 1);
      eth.fillRect(left - 10, top + 28, width + 20, 14);
      eth.fillRect(left - 12, top + 179, width + 24, 13);

      eth.fillStyle(0xd7ccba, 1);
      eth.fillRect(left + 150, top - 17, 155, 243);

      eth.fillStyle(0x858078, 1);
      eth.fillTriangle(
        left + 139,
        top - 17,
        left + 228,
        top - 52,
        left + 316,
        top - 17
      );

      for (const y of [top + 62, top + 126]) {
        for (let x = left + 31; x < left + width - 19; x += 50) {
          eth.fillStyle(0x48626b, 1);
          eth.fillCircle(x, y, 10);
          eth.fillRect(x - 10, y, 20, 28);
          eth.lineStyle(2, 0xe6ddca, 1);
          eth.strokeCircle(x, y, 10);
          eth.strokeRect(x - 10, y, 20, 28);
        }
      }

      const doorX = 1458;

      eth.fillStyle(0x363432, 1);
      eth.fillCircle(doorX, 225, 39);
      eth.fillRect(doorX - 39, 225, 78, 61);

      eth.fillStyle(0x26373d, 1);
      eth.fillRect(doorX - 29, 228, 58, 58);

      eth.lineStyle(4, 0xe0d4bd, 1);
      eth.strokeCircle(doorX, 225, 39);

      this.add.text(
        1458,
        34,
        "ETH ZÜRICH",
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "11px",
          color: "#403b35",
          stroke: "#efe6d4",
          strokeThickness: 4
        }
      )
        .setOrigin(0.5)
        .setDepth(2);

      // Outdoor life.
      [455, 700].forEach((x) => {
        const bench = this.add.graphics().setDepth(3);
        bench.fillStyle(0x6c523b, 1);
        bench.fillRoundedRect(x - 43, 277, 86, 8, 2);
        bench.fillStyle(0x49423c, 1);
        bench.fillRect(x - 34, 284, 5, 18);
        bench.fillRect(x + 29, 284, 5, 18);
      });

      const bikes = this.add.graphics().setDepth(3);
      bikes.lineStyle(2, 0x41484a, 1);

      [1000, 1060].forEach((x) => {
        bikes.strokeCircle(x - 14, 297, 10);
        bikes.strokeCircle(x + 14, 297, 10);
        bikes.lineBetween(x - 14, 297, x, 281);
        bikes.lineBetween(x, 281, x + 14, 297);
        bikes.lineBetween(x - 14, 297, x + 7, 297);
      });

      this.add.text(
        650,
        244,
        "POLYTERRASSE",
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "7px",
          color: "#fff1d0",
          stroke: "#404648",
          strokeThickness: 4
        }
      )
        .setOrigin(0.5)
        .setDepth(3);
    }

    createUpperStation() {
      const zone = this.add.zone(
        164,
        255,
        170,
        132
      )
        .setDepth(245)
        .setInteractive({ useHandCursor: true });

      const marker = this.createPulsingInteractionMarker?.(
        164,
        287,
        176
      );

      zone.on("pointerdown", (pointer) => {
        stopEvent(pointer?.event);

        if (
          this.__ethDialogueActive ||
          this.__ethTransitionActive ||
          this.uiLocked
        ) {
          return;
        }

        this.rideDown();
      });

      this.__upperStationZone = zone;
      this.__upperStationMarker = marker;
    }

    rideDown() {
      if (
        this.exiting ||
        this.__ethTransitionActive ||
        this.__ethDialogueActive
      ) {
        return;
      }

      this.exiting = true;
      this.__ethTransitionActive = true;

      syncSharedState(this);
      this.player?.setVelocity?.(0, 0);
      this.setUILocked?.(true);
      setOutdoorSceneUiVisible(this, false);

      const game = getGame() || this.game;
      const world = this.overworld;

      this.cameras.main.fadeOut(150, 0, 0, 0);

      this.time.delayedCall(170, () => {
        try {
          // ScenePlugin.start safely shuts down THIS terrace and starts transit
          // as one Phaser transition. Avoid stop(scene) followed by start(scene)
          // from the global manager, which caused intermittent return freezes.
          this.scene.start(TRANSIT_KEY, {
            overworld: world,
            direction: "down"
          });
        } catch (error) {
          console.error("ETH v59: Rückfahrt konnte nicht starten:", error);

          try {
            this.scene.start(
              "BahnhofquaiScene",
              bahnhofDataFromPolybahn(world)
            );
          } catch {}
        }
      });
    }

    createEthEntrance() {
      const zone = this.add.zone(
        1458,
        260,
        104,
        132
      )
        .setDepth(245)
        .setInteractive({ useHandCursor: true });

      const marker = this.createPulsingInteractionMarker?.(
        1458,
        287,
        176
      );

      zone.on("pointerdown", (pointer) => {
        stopEvent(pointer?.event);

        if (
          this.__ethDialogueActive ||
          this.__ethTransitionActive ||
          this.uiLocked
        ) {
          return;
        }

        this.enterETH();
      });

      this.__ethDoorZone = zone;
      this.__ethDoorMarker = marker;
    }

    enterETH() {
      if (
        this.exiting ||
        this.__ethTransitionActive ||
        this.__ethDialogueActive
      ) {
        return;
      }

      const game = getGame() || this.game;
      if (!game?.scene?.keys?.[ETH_KEY]) return;

      syncSharedState(this);

      this.__ethTransitionActive = true;
      this.player?.setVelocity?.(0, 0);
      this.setUILocked?.(true);
      setOutdoorSceneUiVisible(this, false, { canonicalHotbar: false });

      this.cameras.main.fadeOut(170, 0, 0, 0);

      this.time.delayedCall(190, () => {
        try {
          this.player?.setVisible?.(false);

          if (this.player?.body) {
            this.player.body.enable = false;
          }

          game.scene.pause(TERRACE_KEY);
          game.scene.start(ETH_KEY, {
            overworld: this.overworld,
            terraceScene: this
          });
        } catch (error) {
          console.error("ETH v59: ETH-Innenraumstart fehlgeschlagen:", error);

          this.player?.setVisible?.(true);

          if (this.player?.body) {
            this.player.body.enable = true;
          }

          this.__ethTransitionActive = false;
          this.uiLocked = false;
          this.setUILocked?.(false);
          setOutdoorSceneUiVisible(this, true);
          this.cameras.main.resetFX();
        }
      });
    }

    resumeFromETH() {
      this.__ethTransitionActive = false;
      this.exiting = false;

      // Refresh scalar state modified in ETH (especially Einstein's coins).
      copySharedState(this, this.overworld);

      this.player?.setVisible?.(true);

      if (this.player?.body) {
        this.player.body.enable = true;
      }

      this.player?.setPosition?.(1375, 235);
      this.player?.setVelocity?.(0, 0);

      this.uiLocked = false;
      this.setUILocked?.(false);
      this.refreshUILock?.();

      setOutdoorSceneUiVisible(this, true, { canonicalHotbar: false });

      this.cameras.main.resetFX();
      this.cameras.main.startFollow(this.player, true, 0.11, 0.11);
      this.cameras.main.setDeadzone(240, 80);

      this.updateCoinHUD?.();
      this.updateHpBar?.();

      window.setTimeout(() => {
        if (!this.sys?.isActive?.()) return;

        if (!this.hotbarDOM?.isConnected) {
          this.hotbarDOM = null;
          this.refreshHotbar?.();
        } else {
          this.hotbarDOM.style.display = "";
          this.hotbarDOM.style.pointerEvents = "";
        }

        const action =
          this.hotbarActionUI?.overlay ||
          this.hotbarActionUI;

        if (action?.style) {
          action.style.display = "";
          action.style.pointerEvents = "";
        }

        this.updateHotbarActionUI?.();
      }, 40);
    }

    update(time, delta) {
      if (
        this.__ethDialogueActive ||
        this.__ethTransitionActive
      ) {
        this.touchLeft = false;
        this.touchRight = false;
        this.touchJumpRequested = false;
        this.touchShootRequested = false;
        this.player?.setVelocityX?.(0);
        return;
      }

      // The full base outdoor movement/interaction loop.
      super.update(time, delta);
    }
  }

// Einstein dialogue / quiz helpers
  // ---------------------------------------------------------------------------

  function chooseQuestion() {
    const seen = new Set(state.seenQuestionIds);
    const correct = new Set(state.correctQuestionIds);

    let pool = QUESTIONS.filter((q) => !seen.has(q.id));

    if (!pool.length) {
      pool = QUESTIONS.filter((q) => !correct.has(q.id));
    }

    if (!pool.length) {
      pool = QUESTIONS;
    }

    return pool[Math.floor(Math.random() * pool.length)];
  }

  function markSeen(id) {
    if (!state.seenQuestionIds.includes(id)) {
      state.seenQuestionIds.push(id);
    }
  }

  function markCorrect(id) {
    if (!state.correctQuestionIds.includes(id)) {
      state.correctQuestionIds.push(id);
      return true;
    }

    return false;
  }

  function createSpeechBubble(scene, actor, text, thought = false) {
    scene.__ethSpeechBubble?.destroy?.(true);
    scene.__ethSpeechBubble = null;

    const x = Phaser.Math.Clamp(actor?.x || 410, 145, ETH_WIDTH - 145);
    const y = Phaser.Math.Clamp((actor?.y || 235) - 125, 64, 205);

    const container = scene.add.container(x, y).setDepth(900);
    const width = 292;
    const height = Math.max(
      62,
      47 + Math.ceil(String(text).length / 34) * 13
    );

    const g = scene.add.graphics();
    g.fillStyle(0xfff8df, 0.98);
    g.lineStyle(3, 0x403832, 1);
    g.fillRoundedRect(-width / 2, -height / 2, width, height, 9);
    g.strokeRoundedRect(-width / 2, -height / 2, width, height, 9);

    if (!thought) {
      g.fillTriangle(
        -12,
        height / 2 - 2,
        5,
        height / 2 + 18,
        18,
        height / 2 - 2
      );
      g.lineStyle(2, 0x403832, 1);
      g.lineBetween(-12, height / 2 - 2, 5, height / 2 + 18);
      g.lineBetween(5, height / 2 + 18, 18, height / 2 - 2);
    }

    const label = scene.add.text(
      0,
      0,
      text,
      {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "6.5px",
        color: "#2c2724",
        align: "center",
        wordWrap: { width: width - 26 },
        lineSpacing: 3
      }
    ).setOrigin(0.5);

    container.add([g, label]);

    if (thought) {
      const c1 = scene.add.circle(-9, height / 2 + 11, 6, 0xfff8df, 1)
        .setStrokeStyle(2, 0x403832, 1);
      const c2 = scene.add.circle(-18, height / 2 + 24, 3.5, 0xfff8df, 1)
        .setStrokeStyle(2, 0x403832, 1);
      container.add([c1, c2]);
    }

    scene.__ethSpeechBubble = container;
    return container;
  }

  function clearSpeechBubble(scene) {
    scene?.__ethSpeechBubble?.destroy?.(true);
    if (scene) scene.__ethSpeechBubble = null;
  }

  function createDialogueOverlay(scene, onAdvance) {
    scene.__ethDialogueOverlay?.remove?.();

    const root = document.getElementById("phaser-game");
    if (!root) return null;

    const overlay = document.createElement("div");
    overlay.dataset.simonUi = "eth-dialogue-v57";

    Object.assign(overlay.style, {
      position: "absolute",
      inset: "0",
      zIndex: "535000",
      background: "transparent",
      pointerEvents: "auto",
      cursor: "pointer",
      touchAction: "manipulation",
      WebkitTapHighlightColor: "transparent"
    });

    let last = -Infinity;

    const down = (event) => stopEvent(event);

    const up = (event) => {
      stopEvent(event);

      const now = performance.now();
      if (now - last < 280) return;

      last = now;
      onAdvance?.();
    };

    overlay.addEventListener("pointerdown", down, { passive: false });
    overlay.addEventListener("pointerup", up, { passive: false });
    overlay.addEventListener("click", up, { passive: false });

    root.appendChild(overlay);
    scene.__ethDialogueOverlay = overlay;
    return overlay;
  }

  function clearDialogue(scene) {
    clearSpeechBubble(scene);
    scene?.__ethDialogueOverlay?.remove?.();

    if (scene) {
      scene.__ethDialogueOverlay = null;
      scene.__ethDialogueActive = false;
    }
  }

  function runDialogue(scene, steps, done = null) {
    if (!scene || !Array.isArray(steps) || !steps.length) {
      done?.();
      return;
    }

    clearDialogue(scene);

    scene.__ethDialogueActive = true;
    scene.player?.setVelocity?.(0, 0);

    let index = 0;
    let actionRunning = false;

    const render = () => {
      clearSpeechBubble(scene);

      const step = steps[index];

      if (!step) {
        clearDialogue(scene);
        done?.();
        return;
      }

      if (step.action) {
        actionRunning = true;

        step.action(() => {
          actionRunning = false;
          index += 1;
          render();
        });

        return;
      }

      const actor =
        step.speaker === "einstein"
          ? scene.__einsteinStatue
          : scene.player;

      if (step.speaker === "simon") {
        scene.player?.setFlipX?.(
          scene.__einsteinStatue?.x < scene.player.x
        );

        if (scene.anims?.exists?.("simon-v14-talk")) {
          scene.player?.setScale?.(0.52);
          scene.player?.play?.("simon-v14-talk", true);
        }
      } else {
        scene.player?.setScale?.(0.42);
        scene.player?.play?.("simon-idle", true);
      }

      createSpeechBubble(
        scene,
        actor,
        step.text,
        Boolean(step.thought)
      );
    };

    createDialogueOverlay(scene, () => {
      if (actionRunning) return;

      index += 1;
      render();
    });

    render();
  }

  function closeQuizModal(scene) {
    scene?.__ethQuizModal?.remove?.();
    if (scene) scene.__ethQuizModal = null;
  }

  function openQuizModal(scene, question) {
    closeQuizModal(scene);

    const root = document.getElementById("phaser-game");
    if (!root) return;

    const overlay = document.createElement("div");
    overlay.dataset.simonUi = "eth-quiz-v57";

    Object.assign(overlay.style, {
      position: "absolute",
      inset: "0",
      zIndex: "545000",
      display: "grid",
      placeItems: "center",
      padding: "14px",
      background: "rgba(8,12,16,.70)",
      pointerEvents: "auto",
      touchAction: "manipulation"
    });

    const panel = document.createElement("div");

    Object.assign(panel.style, {
      width: "min(94%, 690px)",
      maxHeight: "91%",
      overflowY: "auto",
      padding: "14px",
      border: "4px solid #b69759",
      background:
        "linear-gradient(180deg,#e8e0ce 0%,#d2c6ad 100%)",
      color: "#252525",
      boxShadow: "7px 7px 0 rgba(0,0,0,.48)"
    });

    const eyebrow = document.createElement("div");
    eyebrow.textContent =
      `EINSTEIN · ${question.category} · FRAGE ${Math.min(100, state.seenQuestionIds.length + 1)}/100`;

    Object.assign(eyebrow.style, {
      marginBottom: "10px",
      color: "#755b2e",
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "5.4px",
      lineHeight: "1.6"
    });

    const qText = document.createElement("div");
    qText.textContent = question.question;

    Object.assign(qText.style, {
      marginBottom: "13px",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      fontWeight: "700",
      fontSize: "12px",
      lineHeight: "1.45"
    });

    const answers = document.createElement("div");

    Object.assign(answers.style, {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "7px"
    });

    question.answers.forEach((answer, index) => {
      const button = createPixelButton(
        `${String.fromCharCode(65 + index)} · ${answer}`,
        {
          minHeight: "42px",
          minWidth: "100%",
          padding: "8px 9px",
          fontSize: "5.4px",
          background: "#3e4850",
          border: "2px solid #74664a"
        }
      );

      button.style.textAlign = "left";

      button.addEventListener("click", (event) => {
        stopEvent(event);
        closeQuizModal(scene);
        resolveAnswer(scene, question, index);
      });

      answers.appendChild(button);
    });

    panel.append(eyebrow, qText, answers);
    overlay.appendChild(panel);
    root.appendChild(overlay);

    scene.__ethQuizModal = overlay;
  }

  function resolveAnswer(scene, question, selectedIndex) {
    markSeen(question.id);
    scene.__einsteinAskedThisVisit = true;

    const correct = selectedIndex === question.correct;

    if (correct) {
      const firstCorrect = markCorrect(question.id);

      if (firstCorrect) {
        scene.coins = (Number(scene.coins) || 0) + 20;
        syncSharedState(scene);

        showLocalNotice(scene, "+20 COINS", "EINSTEIN HAT GEZAHLT", 2600);
      }

      const steps = firstCorrect
        ? [
            { speaker: "einstein", text: "Hm." },
            { speaker: "einstein", text: "Akzeptabel." },
            { speaker: "simon", text: "Das isch alles?" },
            {
              speaker: "einstein",
              text: "Zwanzig Münzen sind zwanzig Münzen."
            }
          ]
        : [
            { speaker: "einstein", text: "Schon wieder richtig." },
            {
              speaker: "einstein",
              text: "Für dieselbe Erkenntnis zahle ich nicht zweimal."
            }
          ];

      runDialogue(scene, steps, () => {
        scene.turnEinsteinHead(false);
      });

      return;
    }

    runDialogue(
      scene,
      [
        { speaker: "einstein", text: "Nein." }
      ],
      () => {
        scene.turnEinsteinHead(false);
      }
    );
  }

  // ---------------------------------------------------------------------------
  // ETH interior
  // ---------------------------------------------------------------------------

  class ETHInteriorScene extends (BaseScene || Phaser.Scene) {
    constructor() {
      super(ETH_KEY);
      this.__simonInteriorScene = true;
      this.overworld = null;
      this.terraceScene = null;
      this.exiting = false;
    }

    init(data = {}) {
      this.__simonInteriorScene = true;
      this.terraceScene = data.terraceScene || null;
      this.exiting = false;
      this.__ethTransitionActive = false;
      this.__ethDialogueActive = false;
      this.__ethItemBusy = false;
      this.__einsteinAskedThisVisit = false;
      this.__einsteinInteractionBusy = false;

      copySharedState(this, data.overworld || null);
    }

    create() {
      this.input.addPointer(3);
      this.input.setTopOnly(true);

      this.physics.world.resume();
      this.physics.world.setBounds(0, 0, ETH_WIDTH, GAME_HEIGHT);
      this.cameras.main.setBounds(0, 0, ETH_WIDTH, GAME_HEIGHT);
      this.cameras.main.setBackgroundColor("#d8d0bf");
      this.cameras.main.resetFX();
      this.cameras.main.fadeIn(230, 0, 0, 0);

      this.createETHArchitecture();

      const ground = this.add.rectangle(
        ETH_WIDTH / 2,
        GROUND_TOP + (GAME_HEIGHT - GROUND_TOP) / 2,
        ETH_WIDTH,
        GAME_HEIGHT - GROUND_TOP,
        0x000000,
        0
      );

      this.physics.add.existing(ground, true);
      this.ground = ground;

      createEthPlayer(this, 132, 235);
      buildLocalControls(this, { showRideHint: true });

      this.createEinstein();
      this.createExit();

      this.cameras.main.startFollow(this.player, true, 0.10, 0.10);
      this.cameras.main.setDeadzone(250, 90);
      this.cameras.main.roundPixels = true;

      this.events.once("shutdown", () => {
        syncSharedState(this);
        clearDialogue(this);
        closeQuizModal(this);
        cleanupEthDOM(this);
        this.terraceScene = null;
        this.overworld = null;
      });
    }

    createETHArchitecture() {
      const g = this.add.graphics().setDepth(-20);

      // Warm limestone / Semper-inspired main hall.
      g.fillStyle(0xd8cfbd, 1);
      g.fillRect(0, 0, ETH_WIDTH, GROUND_TOP);

      // Skylight and upper clerestory.
      g.fillStyle(0x8faeb8, 1);
      g.fillRoundedRect(250, 18, 680, 46, 8);
      g.lineStyle(5, 0x7b766c, 1);
      g.strokeRoundedRect(250, 18, 680, 46, 8);

      for (let x = 270; x < 930; x += 52) {
        g.lineStyle(2, 0xcbdadc, 0.8);
        g.lineBetween(x, 22, x, 60);
      }

      // Cornices.
      g.fillStyle(0xb4aa98, 1);
      g.fillRect(0, 78, ETH_WIDTH, 14);
      g.fillStyle(0x8b8376, 1);
      g.fillRect(0, 94, ETH_WIDTH, 5);

      // Tall arcades and pillars.
      [145, 345, 545, 745, 945, 1135].forEach((x) => {
        g.fillStyle(0xb3aa99, 1);
        g.fillRect(x - 15, 95, 30, 208);
        g.fillStyle(0xe2dacb, 1);
        g.fillRect(x - 23, 91, 46, 12);
        g.fillRect(x - 25, 296, 50, 11);
      });

      g.lineStyle(12, 0xb3aa99, 1);
      [145, 345, 545, 745, 945].forEach((x) => {
        g.strokeCircle(x + 100, 168, 94);
      });

      // Deep blue-gray recesses behind arches.
      for (let x = 167; x < 1110; x += 200) {
        g.fillStyle(0x6b7c80, 0.72);
        g.fillRoundedRect(x, 126, 155, 143, 28);
      }

      // Grand central staircase.
      g.fillStyle(0x9a9387, 1);
      for (let i = 0; i < 8; i += 1) {
        g.fillRect(
          500 - i * 15,
          286 - i * 12,
          180 + i * 30,
          11
        );
      }

      // Dark iron railing.
      g.lineStyle(4, 0x3d4140, 1);
      g.lineBetween(388, 198, 505, 286);
      g.lineBetween(792, 198, 675, 286);

      for (let i = 0; i <= 8; i += 1) {
        g.lineBetween(
          402 + i * 13,
          211 + i * 10,
          402 + i * 13,
          241 + i * 10
        );

        g.lineBetween(
          778 - i * 13,
          211 + i * 10,
          778 - i * 13,
          241 + i * 10
        );
      }

      // Stone floor.
      g.fillStyle(0xc4baa8, 1);
      g.fillRect(0, 304, ETH_WIDTH, 34);

      g.lineStyle(1, 0x9a9184, 0.75);
      for (let x = 0; x < ETH_WIDTH; x += 56) {
        g.lineBetween(x, 304, x + 24, 338);
      }

      // Notice boards.
      [260, 912].forEach((x) => {
        g.fillStyle(0x735744, 1);
        g.fillRect(x - 42, 188, 84, 73);
        g.fillStyle(0xe8e0c7, 1);
        g.fillRect(x - 34, 196, 27, 22);
        g.fillRect(x + 2, 199, 31, 18);
        g.fillRect(x - 27, 227, 53, 22);
      });

      this.add.text(
        ETH_WIDTH / 2,
        105,
        "ETH ZÜRICH · HAUPTGEBÄUDE",
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "10px",
          color: "#534c43",
          stroke: "#efe8d9",
          strokeThickness: 5
        }
      )
        .setOrigin(0.5)
        .setDepth(-5);

      // Quiet student silhouettes.
      [
        [205, 314, 0x34424d],
        [323, 316, 0x55403d],
        [835, 315, 0x354c45],
        [1010, 315, 0x47415b]
      ].forEach(([x, y, coat]) => {
        const s = this.add.graphics().setDepth(1);
        s.fillStyle(0xc69a79, 1);
        s.fillCircle(x, y - 61, 9);
        s.fillStyle(coat, 1);
        s.fillRoundedRect(x - 12, y - 51, 24, 35, 6);
        s.fillStyle(0x292d33, 1);
        s.fillRect(x - 10, y - 17, 8, 17);
        s.fillRect(x + 2, y - 17, 8, 17);
      });
    }

    createEinstein() {
      const x = 590;
      const bottom = 305;

      const statue = this.add.container(x, bottom).setDepth(8);

      const plinth = this.add.graphics();
      plinth.fillStyle(0x777168, 1);
      plinth.fillRect(-44, -28, 88, 28);
      plinth.fillStyle(0x9d9589, 1);
      plinth.fillRect(-36, -42, 72, 14);
      plinth.lineStyle(2, 0xc2b9a7, 1);
      plinth.strokeRect(-44, -28, 88, 28);

      const body = this.add.graphics();
      body.fillStyle(0x756a56, 1);
      body.fillRoundedRect(-27, -107, 54, 69, 9);
      body.fillRect(-21, -47, 15, 19);
      body.fillRect(6, -47, 15, 19);

      // Jacket / lapels.
      body.lineStyle(3, 0x4d493e, 1);
      body.lineBetween(-20, -95, 0, -69);
      body.lineBetween(20, -95, 0, -69);
      body.lineBetween(0, -70, 0, -42);

      const head = this.add.container(0, -126);

      const hg = this.add.graphics();
      hg.fillStyle(0x776c58, 1);
      hg.fillCircle(0, 0, 22);

      // Wild bronze hair.
      hg.fillStyle(0x635b4c, 1);
      [
        [-21, -12], [-18, -22], [-9, -25], [0, -27],
        [10, -25], [19, -20], [23, -10]
      ].forEach(([hx, hy]) => hg.fillCircle(hx, hy, 8));

      // Moustache / eyes.
      hg.fillStyle(0x4d493f, 1);
      hg.fillRect(-9, -3, 4, 3);
      hg.fillRect(5, -3, 4, 3);
      hg.fillRoundedRect(-10, 8, 20, 5, 2);

      head.add(hg);
      statue.add([plinth, body, head]);

      const plaque = this.add.text(
        x,
        bottom - 13,
        "A. EINSTEIN",
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "4.5px",
          color: "#e8dcc0"
        }
      )
        .setOrigin(0.5)
        .setDepth(10);

      const prompt = this.add.text(
        x,
        bottom - 176,
        "KLICK · PHYSIK",
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "5px",
          color: "#7e612d",
          stroke: "#f0e5d1",
          strokeThickness: 4
        }
      )
        .setOrigin(0.5)
        .setDepth(10);

      const zone = this.add.zone(
        x,
        bottom - 86,
        96,
        168
      )
        .setDepth(260)
        .setInteractive({ useHandCursor: true });

      zone.on("pointerdown", (pointer) => {
        stopEvent(pointer?.event);
        this.interactEinstein();
      });

      this.__einsteinStatue = statue;
      this.__einsteinHead = head;
      this.__einsteinPlaque = plaque;
      this.__einsteinPrompt = prompt;
      this.__einsteinZone = zone;
    }

    turnEinsteinHead(alive, done = null) {
      const head = this.__einsteinHead;
      if (!head) {
        done?.();
        return;
      }

      this.tweens.add({
        targets: head,
        angle: alive ? -11 : 0,
        x: alive ? -4 : 0,
        duration: 420,
        ease: "Sine.easeInOut",
        onComplete: done
      });
    }

    interactEinstein() {
      if (
        this.__einsteinInteractionBusy ||
        isSceneBusy(this)
      ) {
        return;
      }

      this.__einsteinInteractionBusy = true;
      this.player.setVelocity?.(0, 0);
      this.player.setFlipX?.(this.__einsteinStatue.x < this.player.x);

      if (this.__einsteinAskedThisVisit) {
        this.turnEinsteinHead(true, () => {
          runDialogue(
            this,
            [
              { speaker: "einstein", text: "Geh jetzt etwas lernen." },
              { speaker: "simon", text: "Ich bin doch in der ETH." },
              { speaker: "einstein", text: "Dann fang an." }
            ],
            () => {
              this.turnEinsteinHead(false);
              this.__einsteinInteractionBusy = false;
            }
          );
        });

        return;
      }

      const startQuiz = () => {
        const question = chooseQuestion();

        if (!question) {
          this.__einsteinInteractionBusy = false;
          return;
        }

        this.__einsteinInteractionBusy = false;
        openQuizModal(this, question);
      };

      if (!state.einsteinIntroSeen) {
        const steps = [
          { speaker: "simon", text: "Einstein." },
          { speaker: "simon", text: "Cool." },
          {
            action: (next) => this.turnEinsteinHead(true, next)
          },
          { speaker: "einstein", text: "Moment." },
          { speaker: "simon", text: "Was zum—" },
          { speaker: "einstein", text: "Physik." },
          { speaker: "simon", text: "Was?" },
          {
            speaker: "einstein",
            text: "Eine Frage. Zwanzig Münzen."
          }
        ];

        if (
          this.booksRead?.generalRelativity &&
          !state.relativityBookRemarkSeen
        ) {
          steps.push(
            {
              speaker: "einstein",
              text: "Du hast mein Buch gelesen."
            },
            { speaker: "simon", text: "Ja." },
            { speaker: "einstein", text: "Verstanden?" },
            { speaker: "simon", text: "..." },
            {
              speaker: "einstein",
              text: "Das werden wir sehen."
            }
          );

          state.relativityBookRemarkSeen = true;
        }

        runDialogue(this, steps, () => {
          state.einsteinIntroSeen = true;
          startQuiz();
        });

        return;
      }

      this.turnEinsteinHead(true, () => {
        runDialogue(
          this,
          [
            { speaker: "einstein", text: "Wieder da." },
            { speaker: "einstein", text: "Physik?" }
          ],
          startQuiz
        );
      });
    }

    createExit() {
      const x = 77;

      const g = this.add.graphics().setDepth(5);
      g.fillStyle(0x716b62, 1);
      g.fillCircle(x, GROUND_TOP - 71, 44);
      g.fillRect(x - 44, GROUND_TOP - 71, 88, 71);
      g.fillStyle(0x344349, 1);
      g.fillCircle(x, GROUND_TOP - 66, 32);
      g.fillRect(x - 32, GROUND_TOP - 66, 64, 66);
      g.lineStyle(4, 0xd3c8b2, 1);
      g.strokeCircle(x, GROUND_TOP - 71, 44);

      this.add.text(
        x,
        GROUND_TOP - 127,
        "POLYTERRASSE",
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "5px",
          color: "#4e4842",
          stroke: "#efe8d7",
          strokeThickness: 4
        }
      )
        .setOrigin(0.5)
        .setDepth(6);

      const zone = this.add.zone(
        x,
        GROUND_TOP - 44,
        100,
        100
      )
        .setDepth(250)
        .setInteractive({ useHandCursor: true });

      zone.on("pointerdown", (pointer) => {
        stopEvent(pointer?.event);
        this.leaveETH();
      });

      this.__ethExitZone = zone;
    }

    leaveETH() {
      if (this.exiting || isSceneBusy(this)) return;

      this.exiting = true;
      syncSharedState(this);
      cleanupEthDOM(this);

      const terrace = this.terraceScene;
      const game = getGame() || this.game;

      this.cameras.main.fadeOut(180, 0, 0, 0);

      this.time.delayedCall(200, () => {
        try {
          game?.scene?.resume?.(TERRACE_KEY);
          terrace?.resumeFromETH?.();
        } catch (error) {
          console.error("ETH v59: Rückkehr auf Polyterrasse fehlgeschlagen:", error);
        } finally {
          // Stop the current interior only after its parent is live again.
          try {
            this.scene.stop();
          } catch {
            game?.scene?.stop?.(ETH_KEY);
          }
        }
      });
    }

    update(time) {
      updateEthMovement(this, time);

      if (
        this.player?.x < 105 &&
        !isSceneBusy(this)
      ) {
        this.leaveETH();
      }
    }
  }

  // ---------------------------------------------------------------------------
  
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // Registration / transition recovery / developer mode
  // ---------------------------------------------------------------------------

  function patchBahnhofPrototype() {
    const SceneClass =
      window.__SIMON_SCENE_CLASSES__?.BahnhofquaiScene;

    if (!SceneClass?.prototype) return;

    const proto = SceneClass.prototype;

    if (
      typeof proto.create !== "function" ||
      proto.create.__ethCampusV59
    ) {
      return;
    }

    const original = proto.create;

    const wrapped = function createWithEthCampusV59(...args) {
      const result = original.apply(this, args);

      if (this.sys?.settings?.key === "BahnhofquaiScene") {
        this.time?.delayedCall?.(0, () => {
          createCampusEntry(this);
          refreshCampusEntryAvailability(this);

          if (this.travelArrivalFrom === "polybahn") {
            // Base Bahnhof correctly restored every persistent field in init().
            // Cancel its normal tram-arrival choreography and make Polybahn
            // return immediate/stable.
            this.forceFinishBahnhofArrival?.();

            this.player?.setPosition?.(
              getPolybahnBahnhofX() - 105,
              250
            );
            this.player?.setVelocity?.(0, 0);

            this.cameras.main.resetFX();
            this.cameras.main.startFollow(
              this.player,
              true,
              0.11,
              0.11
            );
            this.cameras.main.setDeadzone(240, 80);

            this.uiLocked = false;
            this.setUILocked?.(false);
            this.refreshUILock?.();
            this.setControlsVisible?.(true);
            this.ensureTicketMachineInteractive?.();
            this.ensureLockerInteractive?.();
            this.ensureTramBoardingInteractive?.();
            this.syncStreetStoreHitboxes?.();
            this.updateCoinHUD?.();
            this.updateHpBar?.();
          }
        });
      }

      return result;
    };

    wrapped.__ethCampusV59 = true;
    proto.create = wrapped;
  }

  function ensureRegistered(game) {
    if (!game?.scene) return false;

    BaseScene = getBaseSceneClass() || BaseScene;

    const scenes = [
      [TRANSIT_KEY, PolybahnTransitScene],
      [TERRACE_KEY, PolyterrasseScene],
      [ETH_KEY, ETHInteriorScene]
    ];

    scenes.forEach(([key, SceneClass]) => {
      if (game.scene.keys?.[key]) return;

      try {
        game.scene.add(key, SceneClass, false);
      } catch (error) {
        console.error(
          `ETH v59: ${key} konnte nicht registriert werden:`,
          error
        );
      }
    });

    return scenes.every(([key]) => Boolean(game.scene.keys?.[key]));
  }

  function recoverPolybahn(game) {
    if (!game?.scene) return;

    const station = getScene(game, "BahnhofquaiScene");
    const terrace = getScene(game, TERRACE_KEY);
    const ethScene = getScene(game, ETH_KEY);

    const ethActive =
      Boolean(ethScene?.sys?.isActive?.());

    if (
      ethActive &&
      terrace?.sys?.isActive?.() &&
      !terrace.sys?.isPaused?.()
    ) {
      try {
        game.scene.pause(TERRACE_KEY);
      } catch {}
    }

    // If a fresh Bahnhof return somehow remains in its synthetic arrival
    // state, force it playable. No scene-resume dependency exists anymore.
    if (
      station?.sys?.isActive?.() &&
      station.travelArrivalFrom === "polybahn" &&
      !station.arrivalFinished &&
      !station.__polybahnReturnRecoveryV57
    ) {
      station.__polybahnReturnRecoveryV57 = true;

      window.setTimeout(() => {
        station.__polybahnReturnRecoveryV57 = false;

        if (
          station.sys?.isActive?.() &&
          !station.arrivalFinished
        ) {
          station.forceFinishBahnhofArrival?.();
          station.player?.setPosition?.(
            getPolybahnBahnhofX() - 105,
            250
          );
          station.uiLocked = false;
          station.setUILocked?.(false);
          station.refreshUILock?.();
          station.setControlsVisible?.(true);
        }
      }, 900);
    }
  }

  function install(game) {
    patchBahnhofPrototype();

    if (!game?.scene) return;

    ensureRegistered(game);

    const station = getScene(game, "BahnhofquaiScene");

    if (station?.sys?.isActive?.()) {
      createCampusEntry(station);
      refreshCampusEntryAvailability(station);
    }

    recoverPolybahn(game);
  }

  function addDeveloperButton() {
    const list = document.querySelector(
      "#developer-menu-screen .dev-destinations"
    );

    if (!list) return;
    if (list.querySelector("[data-dev-target='eth-test']")) return;

    const button = document.createElement("button");
    button.className = "dev-action dev-destination";
    button.type = "button";
    button.dataset.devTarget = "eth-test";

    button.innerHTML =
      '8. POLYBAHN / ETH' +
      '<small>Bahnhofstrasse direkt neben dem Polybahn-Eingang starten.</small>';

    button.addEventListener("click", (event) => {
      stopEvent(event);

      window.launchGame?.({
        startMode: "eth-test"
      });
    });

    list.appendChild(button);
  }

  function startEthDeveloper(game) {
    let attempts = 0;

    const attempt = () => {
      attempts += 1;
      install(game);

      const station = getScene(game, "BahnhofquaiScene");

      if (
        station?.sys?.isActive?.() &&
        station.arrivalFinished &&
        station.player?.active &&
        ensureRegistered(game)
      ) {
        station.developerMode = true;
        station.coins = 999999;
        station.updateCoinHUD?.();

        const x = getPolybahnBahnhofX();

        station.player?.setPosition?.(x - 115, 235);
        station.player?.setVelocity?.(0, 0);
        station.cameras.main.startFollow(
          station.player,
          true,
          0.11,
          0.11
        );

        createCampusEntry(station);
        return;
      }

      if (attempts < 160) {
        window.setTimeout(attempt, 90);
      }
    };

    window.setTimeout(attempt, 240);
  }

  const previousStart = window.startSimonGame;

  if (typeof previousStart === "function") {
    window.startSimonGame = function startSimonGameEthV59(options = {}) {
      if (options.startMode === "eth-test") {
        const game = previousStart.call(
          this,
          {
            ...options,
            startMode: "hb",
            developerMode: true
          }
        );

        if (game) startEthDeveloper(game);
        return game;
      }

      const game = previousStart.call(this, options);

      if (game) install(game);
      return game;
    };
  }

  patchBahnhofPrototype();
  addDeveloperButton();

  // 250 ms is enough for recovery/late scene registration and avoids adding
  // another full requestAnimationFrame polling loop to the growing patch stack.
  const timer = window.setInterval(() => {
    install(getGame());
  }, 250);

  const publicApi = Object.freeze({
    VERSION,
    state,
    QUESTIONS,

    install,
    recover() {
      recoverPolybahn(getGame());
    },

    enter() {
      const game = getGame();
      const station = getScene(game, "BahnhofquaiScene");

      if (!station) return false;

      return startPolybahnFromBahnhof(station);
    },

    resetQuizProgress() {
      state.einsteinIntroSeen = false;
      state.relativityBookRemarkSeen = false;
      state.seenQuestionIds.splice(0);
      state.correctQuestionIds.splice(0);
    },

    status() {
      const game = getGame();

      return {
        questions: QUESTIONS.length,
        seen: state.seenQuestionIds.length,
        correct: state.correctQuestionIds.length,
        introSeen: state.einsteinIntroSeen,
        transitActive:
          Boolean(getScene(game, TRANSIT_KEY)?.sys?.isActive?.()),
        terraceActive:
          Boolean(getScene(game, TERRACE_KEY)?.sys?.isActive?.()),
        ethActive:
          Boolean(getScene(game, ETH_KEY)?.sys?.isActive?.()),
        polybahnUnlocked:
          polybahnStoryUnlocked(getScene(game, "BahnhofquaiScene")),
        hitboxes: {
          bahnhofPolybahnX:
            getScene(game, "BahnhofquaiScene")
              ? getPolybahnBahnhofX()
              : null,
          terracePolybahnX: 164,
          ethDoorX: 1458,
          einsteinX: 590
        }
      };
    }
  });

  // The Orell hint can unlock the Polybahn while Bahnhofstrasse is already
  // running. v58 only evaluated the lock when the scene was created, so its
  // interaction marker/button could remain missing until a reload.
  if (!window.__SIMON_POLYBAHN_REFRESH_V59__) {
    window.__SIMON_POLYBAHN_REFRESH_V59__ =
      window.setInterval(() => {
        const game = getGame();
        const station =
          getScene(
            game,
            "BahnhofquaiScene"
          );

        if (
          station?.sys?.isActive?.()
        ) {
          createCampusEntry(station);
          refreshCampusEntryAvailability(
            station
          );
        }
      }, 250);
  }

  window.SimonETHV59 = publicApi;
  window.SimonETHV58 = publicApi;
  window.SimonETHV57 = publicApi;
  window.SimonETHV56 = publicApi;
  window.SimonETHV55 = publicApi;
  window.SimonETHV53 = publicApi;
  window.SimonETHV51 = publicApi;

  console.info(
    "ETH Campus v59: Polybahn links von der Tram, robuste Transit-Szene, Polyterrasse outdoor, Einstein mittig."
  );
})();
