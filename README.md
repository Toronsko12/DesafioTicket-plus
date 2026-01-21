# Prueba Técnica Ticketplus


Este proyecto implementa el flujo completo de seleccion y reserva de asientos para un evento, simulando el comportamiento de una ticketera real.
Se realizo un mock-up de frontend donde se permite visualizar un evento, seleccionar una zona del venue ficticio, elegir asientos disponibles, ver un resumen en tiempo real y completar una reserva con control de tiempo.

## Funcionalidades implementades

### 1. Vista del Evento
- Card principal con:
  - Imagen del evento
  - Título y subtítulo
  - Información visual destacada
- Diseño responsive y centrado.

 ### 2. Selección de Zona
- Representación visual del escenario.
- Zonas disponibles:
  - **VIP**
  - **Platea**
  - **General**
- Cada zona es clickeable y conduce al mapa de asientos correspondiente.
- Colores diferenciados por zona para mejor UX.
### 3. Mapa de Asientos
- Visualización de asientos por:
  - Sección
  - Fila
  - Número
- Estados de asientos:
  - Disponible
  - Ocupado
  - No disponible
  - Seleccionado
- Asientos representados como **círculos**, con colores por zona.
- Selección y deselección individual.
- Límite máximo de asientos por compra (**6**).

 ### 4. Resumen de Compra
- Lista de asientos seleccionados.
- Cálculo en tiempo real de:
  - Subtotal
  - Cargo por servicio (10%)
  - Total
- Botones de acción:
  - Reservar
  - Limpiar selección
- El resumen se mantiene visible sin romper el layout.

### 5. Temporizador de Reserva
- El temporizador:
- Al expirar:
  - Se liberan los asientos automáticamente
  - Se muestra un mensaje informativo al usuario
 
 ### 6. Bottom Bar (Mobile / UX)
- Barra inferior fija con:
  - Cantidad de asientos seleccionados
  - Total a pagar
  - Acciones rápidas

## Tecnologías Utilizadas

- **React**
- **TypeScript**
- **Vite**
- **CSS-in-JS (estilos inline centralizados)**
- **Hooks de React**
  - `useState`
  - `useEffect`
  - `useMemo`

## Arquitectura y Organización

```text
src/
├── components/        # Componentes UI (SeatMap, Summary, Header, etc.)
├── domain/            # Lógica de dominio (types, utils, seatData)
├── styles/            # Estilos centralizados
├── App.tsx            # Composición principal y flujo de la app
└── main.tsx
