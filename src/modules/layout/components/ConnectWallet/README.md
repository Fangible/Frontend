async sendTransaction(
        transaction: Transaction,
        connection: Connection,
        options: SendTransactionOptions = {}
    ): Promise<TransactionSignature> {
        try {
            try {
                transaction.feePayer ||= this.publicKey || undefined;
                transaction.recentBlockhash ||= (await connection.getRecentBlockhash('finalized')).blockhash;

                const { signers, ...sendOptions } = options;

                signers?.length && transaction.partialSign(...signers);

                transaction = await this.signTransaction(transaction);

                const rawTransaction = transaction.serialize();

                return await connection.sendRawTransaction(rawTransaction, sendOptions);
            } catch (error: any) {
                if (error instanceof WalletError) throw error;
                throw new WalletSendTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }