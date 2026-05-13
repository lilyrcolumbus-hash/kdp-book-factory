# Setup — KDP Book Factory + n8n

Pasos para dejar la fábrica corriendo. Sigue en orden.

---

## 1. Crear cuenta en fal.ai (1 vez)

fal.ai es el proveedor que corre los modelos Flux. Una sola API key da acceso a todos.

1. Ir a https://fal.ai → **Sign up** (puedes usar Google).
2. Verificar email.
3. Ir a **Dashboard → API Keys** → **Create new key** → copiarla. Empieza con `fal-...`.
4. Cargar saldo: **Billing → Add credits** → $5 alcanzan para ~1500 imágenes Flux Schnell + ~125 Flux Pro Ultra (más que suficiente para los 3 primeros libros).

Guarda la API key — la pegamos en n8n más abajo.

---

## 2. Levantar n8n con Docker (1 vez)

Ya tienes Docker instalado. Abrir Terminal y pegar:

```bash
docker run -d --name n8n --restart unless-stopped \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  -e N8N_SECURE_COOKIE=false \
  -e GENERIC_TIMEZONE=America/New_York \
  docker.n8n.io/n8nio/n8n
```

Esperar 30 segundos. Abrir en navegador: **http://localhost:5678**

Te pedirá crear cuenta de admin (correo + contraseña). Es local, solo en tu Mac.

---

## 3. Configurar la credencial de fal.ai (1 vez)

Dentro de n8n:

1. Sidebar izquierdo → **Credentials** → **Add credential**.
2. Buscar **Header Auth** → seleccionar.
3. Nombre: `fal.ai API Key`
4. Header Name: `Authorization`
5. Header Value: `Key TU_FAL_KEY_AQUI` ← pega tu key con la palabra `Key` y un espacio antes.
6. **Save**.

---

## 4. Importar el workflow

1. n8n → sidebar izquierdo → **Workflows** → **Add workflow** → menú "..." → **Import from File**.
2. Seleccionar `/Users/ld/kdp-book-factory/n8n/workflow.book-images.json`.
3. Verificar que los nodos **Flux Pro Ultra** y **Flux Schnell** muestren la credencial `fal.ai API Key` seleccionada (si dice "select credential", abrirlo y elegirla).
4. Botón **Active** arriba a la derecha → **ON**.

El webhook ahora escucha en:
```
http://localhost:5678/webhook/book-images
```

---

## 5. Probar primero con el manifest de TEST (3 páginas)

**Antes** de gastar el run completo del libro, validamos el flujo y el estilo con solo 3 páginas:

```bash
curl -X POST http://localhost:5678/webhook/book-images \
  -H "Content-Type: application/json" \
  -d @/Users/ld/kdp-book-factory/n8n/manifest.test.first-3-pages.json
```

Esto genera **3 páginas × 3 samples = 9 imágenes** (cover front + Word Hunters divider + página de quote). Costo: **~$0.54**. Tarda ~2-3 minutos.

**Cuando confirmes visualmente que las 9 imágenes salieron bien**, corres el manifest completo:

```bash
curl -X POST http://localhost:5678/webhook/book-images \
  -H "Content-Type: application/json" \
  -d @/Users/ld/kdp-book-factory/n8n/manifest.example.mega-puzzle-teens.json
```

Esto genera el libro completo: **11 páginas × 3 samples = 33 imágenes** (2 portadas + 7 section dividers + 2 fondos interiores). Costo: **~$2**. Tarda ~5-7 minutos.

La respuesta de cualquiera de los dos es un JSON con TODAS las variantes para que escojas la mejor de cada página:

```json
{
  "bookId": "mega-puzzle-teens-vol1",
  "totalPages": 10,
  "successCount": 10,
  "images": [
    {
      "n": 0,
      "type": "cover-front",
      "out": "cover-front.png",
      "samplesReturned": 3,
      "samples": [
        { "variant": 1, "url": "https://fal.media/..." },
        { "variant": 2, "url": "https://fal.media/..." },
        { "variant": 3, "url": "https://fal.media/..." }
      ]
    },
    ...
  ]
}
```

Las imágenes están alojadas en CDN de fal.ai (URLs permanentes). Abres las 3 variantes de cada página en el navegador, escoges la mejor, y esa es la que se queda.

---

## 6. Verificar visualmente

Copia cualquier `url` del JSON respuesta y pégala en el navegador. Si ves la imagen generada → todo funciona.

---

## Comandos útiles

| Acción | Comando |
|---|---|
| Ver logs n8n | `docker logs -f n8n` |
| Reiniciar n8n | `docker restart n8n` |
| Parar n8n | `docker stop n8n` |
| Volver a arrancar | `docker start n8n` |
| Borrar todo y empezar de cero | `docker rm -f n8n && rm -rf ~/.n8n` |

---

## Costos reales de fal.ai (a abril 2026)

| Modelo | Precio/imagen |
|---|---|
| Flux Schnell | ~$0.003 |
| Flux Pro 1.1 Ultra | ~$0.06 |

**Modo MÁXIMA CALIDAD** (todo Flux Pro Ultra + 3 samples por página):

| Libro | Imágenes únicas | Samples totales | Costo |
|---|---|---|---|
| Mega Puzzle Teens (1er libro) | 10 | 30 | **~$1.80** |
| Self-Care Planner | 80 | 240 | ~$14 |
| Destructive Journal | 60 | 180 | ~$11 |

Para tu primer libro (Mega Puzzle Teens) con $5 de crédito tienes margen de sobra para regenerar páginas que no te gusten.

---

## Si algo falla

| Síntoma | Causa probable | Fix |
|---|---|---|
| Webhook devuelve 401 | API key mal formateada | Asegúrate de que el header value diga `Key fal-...` (con la palabra Key delante) |
| Webhook devuelve 404 | Workflow no está activo | Botón "Active" → ON |
| `successCount: 0` | Sin saldo en fal.ai | Recargar en fal.ai → Billing |
| Timeout en Flux Pro | Modelo saturado | Esperar 30s y reintentar |
| n8n no abre en localhost:5678 | Docker no corre | `docker ps` para verificar, `docker start n8n` |

---

## Próximo paso (después de validar)

Cuando confirmes que las 10 imágenes del Mega Puzzle Book salieron bien:

1. Hacemos los manifests para los otros 2 libros (Self-Care Planner, Destructive Journal).
2. Construimos el script que **descarga las imágenes y las compone como fondo del PDF base** del libro.
3. Output final: PDF listo para subir a KDP.
