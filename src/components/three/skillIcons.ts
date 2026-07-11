// Table partagée nom d'icône → composant react-icons. Utilisée par la grille de
// badges (TechStack) et par la constellation 3D (NetworkSphere).

import {
  SiReact, SiNextdotjs, SiTypescript, SiJavascript, SiTailwindcss, SiFramer,
  SiVuedotjs, SiAngular, SiSvelte, SiAstro,
  SiNodedotjs, SiPrisma, SiPostgresql, SiMongodb, SiMysql, SiSqlite, SiGraphql,
  SiPython, SiDjango, SiPhp, SiLaravel, SiRust, SiGo, SiRedis, SiSupabase, SiFirebase,
  SiDocker, SiKubernetes, SiVercel, SiGithubactions, SiGit, SiNginx, SiLinux,
  SiGooglecloud,
  SiFigma, SiPostman, SiGithub, SiNotion, SiJira,
} from "react-icons/si";
import { TbApi, TbBrandVscode } from "react-icons/tb";
import type { IconType } from "react-icons";

export interface SkillNode {
  name: string;
  iconName: string;
}

export const ICON_MAP: Record<string, IconType> = {
  SiReact, SiNextdotjs, SiTypescript, SiJavascript, SiTailwindcss, SiFramer,
  SiVuedotjs, SiAngular, SiSvelte, SiAstro,
  SiNodedotjs, SiPrisma, SiPostgresql, SiMongodb, SiMysql, SiSqlite, SiGraphql,
  SiPython, SiDjango, SiPhp, SiLaravel, SiRust, SiGo, SiRedis, SiSupabase, SiFirebase,
  SiDocker, SiKubernetes, SiVercel, SiGithubactions, SiGit, SiNginx, SiLinux,
  SiGooglecloud,
  SiFigma, SiPostman, SiGithub, SiNotion, SiJira,
  TbBrandVscode, TbApi,
};
