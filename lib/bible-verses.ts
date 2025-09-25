// Sistema de versículos bíblicos rotativos para a agenda diária

interface BibleVerse {
  text: string
  reference: string
}

const BIBLE_VERSES: BibleVerse[] = [
  {
    text: 'Tudo tem o seu tempo determinado, e há tempo para todo o propósito debaixo do céu.',
    reference: 'Eclesiastes 3:1',
  },
  {
    text: 'O coração do homem planeja o seu caminho, mas o Senhor lhe dirige os passos.',
    reference: 'Provérbios 16:9',
  },
  {
    text: 'Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento.',
    reference: 'Provérbios 3:5',
  },
  {
    text: 'Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz e não de mal, para vos dar o fim que esperais.',
    reference: 'Jeremias 29:11',
  },
  {
    text: 'Posso todas as coisas naquele que me fortalece.',
    reference: 'Filipenses 4:13',
  },
  {
    text: 'E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus.',
    reference: 'Romanos 8:28',
  },
  {
    text: 'O Senhor é o meu pastor; nada me faltará.',
    reference: 'Salmos 23:1',
  },
  {
    text: 'Lança o teu cuidado sobre o Senhor, e ele te susterá; nunca permitirá que o justo seja abalado.',
    reference: 'Salmos 55:22',
  },
  {
    text: 'Mas os que esperam no Senhor renovarão as suas forças; subirão com asas como águias.',
    reference: 'Isaías 40:31',
  },
  {
    text: 'O Senhor é a minha luz e a minha salvação; a quem temerei?',
    reference: 'Salmos 27:1',
  },
  {
    text: 'Porque pela graça sois salvos, por meio da fé; e isto não vem de vós, é dom de Deus.',
    reference: 'Efésios 2:8',
  },
  {
    text: 'Não temas, porque eu sou contigo; não te assombres, porque eu sou teu Deus.',
    reference: 'Isaías 41:10',
  },
  {
    text: 'Buscai primeiro o reino de Deus, e a sua justiça, e todas estas coisas vos serão acrescentadas.',
    reference: 'Mateus 6:33',
  },
  {
    text: 'Porque onde estiver o vosso tesouro, aí estará também o vosso coração.',
    reference: 'Mateus 6:21',
  },
  {
    text: 'Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.',
    reference: 'Mateus 11:28',
  },
  {
    text: 'A palavra de Deus é viva e eficaz, e mais penetrante do que espada alguma de dois gumes.',
    reference: 'Hebreus 4:12',
  },
  {
    text: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito.',
    reference: 'João 3:16',
  },
  {
    text: 'Se confessarmos os nossos pecados, ele é fiel e justo para nos perdoar os pecados.',
    reference: '1 João 1:9',
  },
  {
    text: 'Alegrai-vos sempre no Senhor; outra vez digo, alegrai-vos.',
    reference: 'Filipenses 4:4',
  },
  {
    text: 'O Senhor é bom, uma fortaleza no dia da angústia; e conhece os que confiam nele.',
    reference: 'Naum 1:7',
  },
  {
    text: 'Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará.',
    reference: 'Salmos 37:5',
  },
  {
    text: 'Porque o Senhor, teu Deus, está contigo por onde quer que andares.',
    reference: 'Josué 1:9',
  },
  {
    text: 'A paz vos deixo, a minha paz vos dou; não vo-la dou como o mundo a dá.',
    reference: 'João 14:27',
  },
  {
    text: 'Sede fortes e corajosos; não temais, nem vos espanteis, porque o Senhor vosso Deus é convosco.',
    reference: 'Josué 1:9',
  },
  {
    text: 'Porque eu sou o Senhor, teu Deus, que te toma pela tua mão direita e te diz: Não temas, que eu te ajudo.',
    reference: 'Isaías 41:13',
  },
  {
    text: 'Grande é a sua fidelidade; as suas misericórdias se renovam cada manhã.',
    reference: 'Lamentações 3:23',
  },
  {
    text: 'Aquietai-vos e sabei que eu sou Deus.',
    reference: 'Salmos 46:10',
  },
  {
    text: 'O Senhor abençoará o seu povo com paz.',
    reference: 'Salmos 29:11',
  },
  {
    text: 'Porque os meus pensamentos não são os vossos pensamentos, nem os vossos caminhos os meus caminhos, diz o Senhor.',
    reference: 'Isaías 55:8',
  },
  {
    text: 'E a paz de Deus, que excede todo o entendimento, guardará os vossos corações e os vossos sentimentos em Cristo Jesus.',
    reference: 'Filipenses 4:7',
  },
  {
    text: 'Porque nele vivemos, e nos movemos, e existimos.',
    reference: 'Atos 17:28',
  },
]

/**
 * Obtém um versículo bíblico baseado na data
 * Usa um algoritmo determinístico para garantir que o mesmo dia sempre tenha o mesmo versículo
 */
export function getDailyBibleVerse(date: string): BibleVerse {
  // Converter a data em um número para usar como índice
  const dateObj = new Date(date + 'T12:00:00')
  const dayOfYear = Math.floor(
    (dateObj.getTime() - new Date(dateObj.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  )

  // Usar o dia do ano para selecionar um versículo
  const index = dayOfYear % BIBLE_VERSES.length

  return BIBLE_VERSES[index]
}

/**
 * Formata o versículo para exibição na mensagem do Telegram
 */
export function formatBibleVerseForTelegram(verse: BibleVerse): string {
  return `📖 *Versículo do Dia:*\n"${verse.text}"\n*${verse.reference}*`
}
