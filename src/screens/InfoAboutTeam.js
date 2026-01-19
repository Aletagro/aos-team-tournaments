import React from 'react'

import Styles from './styles/TournamentRules.module.css'

const TournamentRules = () => {
    return <div id='column' className='Chapter'>
        <p id={Styles.text}>Чтобы встуgить в команду нужно сделать следующие шаги:</p>
        <p id={Styles.text}>1. На главном экране приложение перейти по кнопке "Список Команд"</p>
        <p id={Styles.text}>2. В списке найти команду, в которую вы хотите вступить, и нажмите на неё</p>
        <p id={Styles.text}>3. В появившимся модальном окне нажмите кнопку Подвердить</p>
        <p id={Styles.text}>4. Поздравляю, вы в команде! (Ну если капитан этой команды согласится конечно)</p>
    </div>
}

export default TournamentRules