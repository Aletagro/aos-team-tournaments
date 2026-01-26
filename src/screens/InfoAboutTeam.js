import React from 'react'

import Styles from './styles/TournamentRules.module.css'

const TournamentRules = () => {
    return <div id='column' className='Chapter'>
        <p id={Styles.text}>Чтобы вступить в команду нужно сделать следующие шаги:</p>
        <p id={Styles.text}>1. Зарегистрировать на турнире как игрок</p>
        <p id={Styles.text}>2. На главном экране приложение перейти по кнопке "Список Команд"</p>
        <p id={Styles.text}>3. В списке найти команду, в которую вы хотите вступить, и нажмите на неё</p>
        <p id={Styles.text}>4. В появившимся модальном окне нажмите кнопку Подвердить</p>
        <p id={Styles.text}>5. Поздравляю, вы в команде! (Ну если капитан этой команды согласится конечно)</p>
    </div>
}

export default TournamentRules