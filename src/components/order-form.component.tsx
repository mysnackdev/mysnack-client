import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { auth } from "../firebase";
import { faChevronCircleUp } from "@fortawesome/free-solid-svg-icons";

export const OrderForm = ({
  showForm,
  userName,
  statusText,
  handleChangeName,
  handleCreateOrder,
  onLogout,
}: {
  showForm: boolean;
  userName: string;
  statusText: string;
  handleChangeName: (value: string) => void;
  handleCreateOrder: (event: React.FormEvent) => void;
  onLogout: (event: React.FormEvent) => void;
}) => {
  return (
    <>
      <div className="flex bg-white h-full flex-col p-2">
        <p className="text-center mb-2  text-sm">
          <span>{`Logado com: ${auth.currentUser?.email}.`}</span>
          <br />
          <span>
            {`Encerrar sessão? `}
            <a href="" className="font-bold" onClick={onLogout}>
              {`Clique aqui`}
            </a>
          </span>
        </p>

        <div className="h-fit w-[200px] p-2 mb-1 bg-secondary rounded">
          <p>
            {statusText ||
              `Olá, poderia nos informar seu nome para iniciarmos o pedido?`}
          </p>
        </div>
      </div>
      <form className="mt-auto flex p-4">
        <input
          className="bg-white rounded w-full me-2 h-8 p-1"
          type="text"
          required
          disabled={!showForm}
          value={userName}
          placeholder="Digite..."
          onChange={(e) => handleChangeName(e.target.value)}
        />

        <button type="submit" onClick={handleCreateOrder} disabled={!showForm}>
          <FontAwesomeIcon icon={faChevronCircleUp} className="fa-xl" />
        </button>
      </form>
    </>
  );
};