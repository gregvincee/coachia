import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { SKILL_PROMPTS } from "../lib/data";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Chat IA pour le coaching
  ai: router({
    chat: publicProcedure
      .input(
        z.object({
          skillId: z.string(),
          messages: z.array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string(),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        const { skillId, messages } = input;

        // Récupérer le prompt système pour la compétence
        const systemPrompt = SKILL_PROMPTS[skillId] || SKILL_PROMPTS["productivity"];

        // Construire les messages pour l'API LLM
        const llmMessages = [
          { role: "system" as const, content: systemPrompt },
          ...messages.map((msg) => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          })),
        ];

        // Appeler l'API LLM
        const response = await invokeLLM({
          messages: llmMessages,
        });

        const content = response.choices[0]?.message?.content;
        const assistantMessage = typeof content === 'string' ? content : "Désolé, je n'ai pas pu générer de réponse.";

        // Générer des suggestions de réponses rapides
        const suggestions = generateQuickReplies(skillId, assistantMessage);

        return {
          message: assistantMessage,
          suggestions,
        };
      }),
  }),
});

// Fonction pour générer des suggestions de réponses rapides
function generateQuickReplies(skillId: string, lastMessage: string): string[] {
  const genericReplies = [
    "Dis-moi plus",
    "Donne-moi un exemple",
    "Comment faire ?",
  ];

  // Suggestions spécifiques par compétence
  const skillSpecificReplies: Record<string, string[]> = {
    "public-speaking": [
      "Donne-moi un exercice pratique",
      "Comment gérer le trac ?",
      "Aide-moi avec ma posture",
    ],
    "creative-writing": [
      "Propose-moi un exercice d'écriture",
      "Comment améliorer mon style ?",
      "Donne-moi de l'inspiration",
    ],
    "productivity": [
      "Explique-moi la méthode Pomodoro",
      "Comment prioriser mes tâches ?",
      "Aide-moi à planifier ma journée",
    ],
    "communication": [
      "Comment mieux écouter ?",
      "Aide-moi à gérer un conflit",
      "Comment être plus assertif ?",
    ],
    "leadership": [
      "Comment motiver mon équipe ?",
      "Aide-moi à prendre une décision",
      "Comment déléguer efficacement ?",
    ],
    "time-management": [
      "Comment éliminer les distractions ?",
      "Aide-moi à planifier ma semaine",
      "Comment équilibrer vie pro et perso ?",
    ],
  };

  const replies = skillSpecificReplies[skillId] || genericReplies;

  // Retourner 3 suggestions aléatoires
  const shuffled = [...replies].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

export type AppRouter = typeof appRouter;
