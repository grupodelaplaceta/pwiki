
export enum ArticleType {
  DEPARTMENT = 'Departamento',
  ENTITY = 'Entidad Pública',
  PRIVATE_COMPANY = 'Empresa Privada',
  ORGANIZATION = 'Organización',
  REGULATION = 'Normativa',
  ARTICLE = 'Artículo',
  SUB_ARTICLE = 'Sub-apartado'
}

export const ARTICLE_ICONS: Record<ArticleType, string> = {
  [ArticleType.DEPARTMENT]: 'fa-building-user',
  [ArticleType.ENTITY]: 'fa-landmark',
  [ArticleType.PRIVATE_COMPANY]: 'fa-briefcase',
  [ArticleType.ORGANIZATION]: 'fa-users-gear',
  [ArticleType.REGULATION]: 'fa-scale-balanced',
  [ArticleType.ARTICLE]: 'fa-file-lines',
  [ArticleType.SUB_ARTICLE]: 'fa-indent',
};

export enum ActivityLevel {
  ACTIVE = 'Activa',
  SEMI_ACTIVE = 'Semi-activa',
  INACTIVE = 'Inactiva'
}

export interface ArticleLogo {
  url: string;
  label: string;
  period?: string;
}

export interface Article {
  id: string;
  title: string;
  type: ArticleType;
  parentId?: string;
  content: string;
  summary?: string;
  activityLevel: ActivityLevel;
  metadata: {
    responsible?: string;
    established?: string;
    status?: string;
    lawCode?: string;
    sector?: string;
    tags: string[];
    logos?: ArticleLogo[];
  };
  updatedAt: string;
}

export interface WikiState {
  articles: Article[];
  currentArticleId: string | null;
  searchQuery: string;
  isEditing: boolean;
  filterType: ArticleType | 'All';
}
