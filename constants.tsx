import { Article, ArticleType, ActivityLevel } from './types';

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'inicio',
    title: 'Bienvenidos a la Wiki de la Placeta',
    type: ArticleType.ARTICLE,
    activityLevel: ActivityLevel.ACTIVE,
    content: `Esta es la base de conocimiento abierta para el ecosistema de **La Placeta**. Aquí encontrarás información sobre las distintas entidades, empresas y normativas que forman parte de nuestro grupo.

## ¿Qué puedes encontrar aquí?
- **Departamentos**: Información sobre la gestión y [[dept-finanzas|Regulación]].
- **Empresas**: Iniciativas privadas como [[emp-tech-placeta|Placeta Tech]].
- **Normativas**: Documentación importante bajo el código [NORM-GENERAL].

## Cómo colaborar
Cualquier miembro puede proponer cambios o crear nuevas páginas para mantener la wiki actualizada.`,
    summary: 'Portal de bienvenida y guía general del ecosistema Placeta.',
    metadata: {
      responsible: 'Equipo Editorial',
      established: '2010',
      status: 'Activo',
      tags: ['General', 'Guía', 'Inicio']
    },
    updatedAt: '2024-05-01T10:00:00Z'
  },
  {
    id: 'dept-finanzas',
    title: 'Área de Finanzas',
    type: ArticleType.ENTITY,
    activityLevel: ActivityLevel.ACTIVE,
    parentId: 'inicio',
    content: `El área de finanzas se encarga de coordinar la estabilidad económica del grupo. 

## Tareas principales
- Gestión de presupuestos.
- Auditoría de cuentas anuales.

Se rige por los criterios de transparencia habituales.`,
    summary: 'Coordinación financiera y cumplimiento del grupo.',
    metadata: {
      responsible: 'Elena Rodríguez',
      established: '1984',
      status: 'Activo',
      tags: ['Finanzas', 'Gestión'],
      logos: [
        { url: 'https://i.postimg.cc/xd6DTcFQ/faviwiki.png', label: 'Logo Corporativo Actual', period: '2015 - Presente' },
        { url: 'https://cdn-icons-png.flaticon.com/512/2830/2830284.png', label: 'Emblema Clásico', period: '1984 - 2014' }
      ]
    },
    updatedAt: '2023-11-15T10:00:00Z'
  },
  {
    id: 'emp-tech-placeta',
    title: 'Placeta Tech',
    type: ArticleType.PRIVATE_COMPANY,
    activityLevel: ActivityLevel.ACTIVE,
    parentId: 'inicio',
    content: `Empresa de tecnología que da soporte digital a todo el ecosistema.

## Servicios
- Mantenimiento web y sistemas.
- Desarrollo de herramientas internas.

Trabajamos bajo estándares de calidad modernos.`,
    summary: 'Soporte tecnológico y desarrollo digital.',
    metadata: {
      responsible: 'Marc Soler',
      sector: 'Tecnología',
      established: '2018',
      status: 'Activo',
      tags: ['Soporte', 'Tecnología'],
      logos: [
        { url: 'https://cdn-icons-png.flaticon.com/512/1055/1055683.png', label: 'Logo Fundacional', period: '2018 - Actual' }
      ]
    },
    updatedAt: '2024-02-10T08:30:00Z'
  }
];