const env = require('../config/env');

const arredondar = (n) => Math.round(n * 100) / 100;
const media = (valores) =>
  valores.length ? arredondar(valores.reduce((a, b) => a + b, 0) / valores.length) : null;

/** Monta o boletim do aluno: média por bimestre, média geral e situação. */
function montarBoletim(aluno, notas) {
  const lista = notas.map((n) => n.toJSON());

  const bimestres = [1, 2, 3, 4].map((bimestre) => {
    const doBimestre = lista.filter((n) => n.bimestre === bimestre);
    return {
      bimestre,
      quantidade: doBimestre.length,
      media: media(doBimestre.map((n) => n.media)),
      notas: doBimestre,
    };
  });

  const mediasBimestrais = bimestres.map((b) => b.media).filter((m) => m !== null);
  const mediaGeral = media(mediasBimestrais);

  return {
    aluno: { id: aluno.id, nome: aluno.nome, matricula: aluno.matricula, serie: aluno.serie },
    mediaGeral,
    situacao:
      mediaGeral === null
        ? 'sem_notas'
        : mediaGeral >= env.MEDIA_APROVACAO
          ? 'aprovado'
          : 'abaixo_da_media',
    mediaAprovacao: env.MEDIA_APROVACAO,
    bimestres,
  };
}

/** Estatísticas da turma a partir de uma lista de notas (já filtradas). */
function estatisticas(notas) {
  const medias = notas.map((n) => Number(n.media));
  if (!medias.length) {
    return {
      total: 0,
      mediaTurma: null,
      maior: null,
      menor: null,
      acimaDaMedia: 0,
      distribuicao: {},
    };
  }

  const faixas = { '0-4.9': 0, '5-6.9': 0, '7-8.9': 0, '9-10': 0 };
  for (const m of medias) {
    if (m < 5) faixas['0-4.9'] += 1;
    else if (m < 7) faixas['5-6.9'] += 1;
    else if (m < 9) faixas['7-8.9'] += 1;
    else faixas['9-10'] += 1;
  }

  return {
    total: medias.length,
    mediaTurma: media(medias),
    maior: Math.max(...medias),
    menor: Math.min(...medias),
    acimaDaMedia: medias.filter((m) => m >= env.MEDIA_APROVACAO).length,
    distribuicao: faixas,
  };
}

module.exports = { montarBoletim, estatisticas };
