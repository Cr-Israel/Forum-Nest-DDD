export abstract class ValueObject<Props> {
  protected props: Props

  protected constructor(props: Props) {
    this.props = props
  }

  public equals(vo: ValueObject<unknown>) {
    if (vo === null || vo === undefined) {
      return false
    }

    if (vo.props === undefined) {
      return false
    }
    /* Eu transformo em texto, para eu conseguir ter uma comparação de texto para texto...
    Porque se eu fizesse assim: return vo.props === this.props
    Um exemplo disso seria:
    {
    name: "carlos"
    }
    ===
    {
    name: "carlos"
    }

    O '===' faz comparação de os 2 objetos ocupam a mesma posição na 
    memória(comparação referencial), por isso retornaria falso. Eu preciso transformar 
    os 2 para uma estrutura de dados que eu consiga comparar somente valor, ex: texto,
    núemro... E a partir daí, eu faço a comparação.
    */
    return JSON.stringify(vo.props) === JSON.stringify(this.props)
  }
}