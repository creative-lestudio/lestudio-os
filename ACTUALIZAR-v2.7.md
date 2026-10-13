# Actualizar a la v2.7 · Planificador del calendario (solo admin)

## Qué trae
- **Calendario jugable** (solo lo ves tú como admin; el cliente sigue viendo su calendario de siempre):
  - **Toca un día** → apuntas una idea en segundos (título, formato, plataforma). Queda como *idea tentativa* (borde discontinuo).
  - **Arrastra** cualquier publicación a otro día para cambiarla de fecha (conserva la hora). En el móvil: mantén pulsado y arrastra.
  - **Bandeja «Sin fecha»**: ideas aún sin día. Arrástralas al calendario, o suelta ahí una publicación para quitarle la fecha.
  - **Referencias en la bandeja**: arrastra una referencia a un día y se convierte en una idea con su formato y plataforma.
  - En la **Biblioteca**, cada referencia tiene el botón **«→ Calendario»**.
  - Después tocas la idea y le vas sumando el copy, la pieza y el estado, poco a poco.
- Las ideas y lo que está «En producción» **no lo ve el cliente**. Solo lo ve cuando lo pasas a «En revisión» o solicitas aprobación.

## Paso 1 (opcional, recomendado) · SQL 08
Sirve para que cada publicación recuerde de qué referencia salió (se ve en su ficha y la Biblioteca la marca «En calendario»).
Sin este paso todo funciona igual, solo que no se guarda ese vínculo.
1. Supabase → **SQL Editor** → **New query**.
2. Pega todo el contenido de `sql/08-referencia-en-publicacion.sql` → **Run**.
3. Abajo debe salir una fila con `reference_id`. Listo.

## Paso 2 · Publicar la web
Se publica sola cuando estos cambios llegan a la rama `main` de GitHub (Cloudflare Pages).
Después, en el móvil/ordenador, recarga la app una vez: abajo del menú debe poner **v2.7.0**.
