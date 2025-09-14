# Snake-Tetris Mashup

Un juego híbrido que combina la mecánica clásica de Snake con piezas de Tetris que caen, creando una experiencia de juego única y desafiante.

## 🎮 Cómo Jugar

### Controles

- **Snake**: Usa las flechas del teclado (↑ ↓ ← →)
- **Tetris**:
  - W/G/H: Rotar pieza
  - A/D: Mover pieza horizontalmente
  - S: Acelerar caída
- **Otros**:
  - SPACE: Pausar/Reanudar
  - R: Reiniciar (solo después de Game Over)

### Objetivo

- Controla la serpiente para comer manzanas rojas y crecer
- Al mismo tiempo, maneja las piezas de Tetris que caen cada segundo
- Las piezas de Tetris se detienen al tocar el suelo, otras piezas, o la serpiente
- ¡Evita que la serpiente toque las paredes o las piezas de Tetris!

## 🌟 Características Implementadas

### ✅ BÁSICO
- Piezas de Tetris se vuelven estáticas al tocar Snake o manzanas
- Sistema de colisiones preciso usando coordenadas de grilla

### ✅ AVANZADO
- Las piezas pueden reposar sobre la serpiente
- Cuando la serpiente se mueve, las piezas caen por gravedad
- Física avanzada de soporte dinámico

### ✅ COMPETITIVO
- Panel de puntuación con diseño retro
- High scores persistentes usando localStorage
- Fuente arcade con efectos de neón

### ✅ POWER-UP
- Estrella dorada con 5% de probabilidad de aparición
- Modo invencible durante 5 segundos (300 frames)
- La serpiente destruye piezas de Tetris al tocarlas
- Efectos visuales de brillo y rotación

## 🎨 Diseño Visual

- **Fondo**: Negro estilo arcade con gradiente sutil
- **Snake**: Verde (#00FF00) con ojos blancos, parpadeo dorado en modo invencible
- **Manzana**: Roja (#FF0000)
- **Piezas Tetris**: Colores clásicos
  - I: Cian (#00FFFF)
  - O: Amarillo (#FFFF00)
  - T: Púrpura (#800080)
  - S: Verde (#00FF00)
  - Z: Rojo (#FF0000)
  - J: Azul (#0000FF)
  - L: Naranja (#FFA500)
- **Power-up**: Estrella dorada con efecto de brillo animado
- **UI**: Tipografía Orbitron con efectos de neón y sombras

## 📁 Estructura del Proyecto

```
snake-tetris/
├── index.html          # Página principal con layout del juego
├── style.css           # Estilos arcade con efectos de neón
├── game.js             # GameManager - coordinación y lógica principal
├── snake.js            # Clase Snake - movimiento y crecimiento
├── tetris.js           # Clase Tetris - piezas, rotación y física
└── README.md           # Documentación
```

## 🔧 Detalles Técnicos

### Rendimiento
- Objetivo: 60 FPS constantes
- Grilla optimizada de 40x30 (800x600px, 20px por celda)
- Renderizado eficiente sin redibujado innecesario

### Sistema de Piezas Tetris
- 7 tipos de Tetriminos con formas y colores oficiales
- Sistema de rotación SRS (Super Rotation System)
- Queue aleatorio con bolsa de 7 piezas para distribución justa
- Wall kicks para rotaciones suaves

### Mecánicas Avanzadas
- **Soporte Dinámico**: Las piezas detectan si están siendo soportadas por la serpiente
- **Caída por Gravedad**: Cuando la serpiente se mueve, las piezas sin soporte caen
- **Detección de Líneas**: System completo de limpieza de líneas completas
- **Invencibilidad**: Modo temporal donde la serpiente destruye piezas al contacto

### Estados del Juego
- `PLAYING`: Juego activo
- `PAUSED`: Juego pausado
- `GAME_OVER`: Fin del juego con opción de reinicio

## 🚀 Cómo Ejecutar

1. Abre `index.html` en cualquier navegador moderno
2. ¡El juego se carga automáticamente!
3. No requiere servidor web - funciona localmente

## 🏆 Puntuación

- **Manzana**: 10 puntos
- **Power-up**: 100 puntos
- **Destruir pieza (modo invencible)**: 50 puntos
- **High Score**: Se guarda automáticamente en localStorage

¡Disfruta de este innovador mashup de dos clásicos atemporales!