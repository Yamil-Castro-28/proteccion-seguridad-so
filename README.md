# Protección y seguridad · Sistemas Operativos

Unidad 6 · Sitio estático para exposición en clase.

Integrantes:
- Jesús Yamil Castro Cano · No. de Control: 25410158
- Gabriel Angel Avalos Silva · No. de Control: 26410012

## Publicar en GitHub Pages

1. Extraer este ZIP.
2. Crear un repositorio y cargar todo su contenido, conservando las carpetas.
   index.html debe estar en la raíz del repositorio.
3. En Settings > Pages, elegir Deploy from a branch, main y / (root).
4. Guardar y esperar a que GitHub muestre la dirección del sitio.

Los enlaces son relativos y funcionan en subdirectorios de GitHub Pages.
No se requiere instalar paquetes ni compilar.

## Editar

Textos: index.html, fuentes.html y las páginas de temas/.
Estilos: assets/styles.css. Interacciones: assets/site.js.

## Abrir localmente

Abrir index.html para consultar el contenido. Para probar también el cifrado,
servir la carpeta con Python 3:

    python3 -m http.server 8000

Después abrir http://localhost:8000. Web Crypto requiere HTTPS o localhost.

El modo Proyección aumenta el texto. Las demostraciones son locales; no
modifican permisos reales ni envían los mensajes. La clave criptográfica se
pierde al recargar. Open Sans incluye su licencia en assets/fonts/LICENSE.txt.

## Fuentes

Tanenbaum (2009), Sistemas operativos modernos, 3.ª edición, cap. 9.
Complementos de NIST, Oracle, OWASP y W3C enlazados en fuentes.html.
El PDF del libro no se redistribuye.
